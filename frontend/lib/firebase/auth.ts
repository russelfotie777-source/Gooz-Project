import { firebaseConfig } from "./config";

// Social sign-in (Google/Facebook) via Firebase Auth's popup flow — Firebase
// handles the OAuth handshake with each provider entirely on its own servers
// (see the account setup notes in the Auth section of the app); this module
// never touches a provider's client secret, only the resulting Firebase ID
// token, which the backend verifies itself (see
// App\Services\FirebaseIdTokenVerifier). Imports are dynamic, mirroring
// lib/firebase/messaging.ts, so the SDK never ends up in a server bundle.
async function getAuthInstance() {
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export class SocialSignInCancelledError extends Error {}

async function signInWithProvider(providerId: "google" | "facebook"): Promise<string> {
  const auth = await getAuthInstance();
  const { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } = await import("firebase/auth");

  const provider = providerId === "google" ? new GoogleAuthProvider() : new FacebookAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    return await result.user.getIdToken();
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      throw new SocialSignInCancelledError();
    }
    throw error;
  }
}

export function signInWithGoogle(): Promise<string> {
  return signInWithProvider("google");
}

export function signInWithFacebook(): Promise<string> {
  return signInWithProvider("facebook");
}

// Email/password sign-in — same idea as the social providers above: Firebase
// owns the credential entirely (backend never sees a password for this
// flow), we only forward the resulting ID token to AuthController::social(),
// which is provider-agnostic. Wraps Firebase's error `code` (e.g.
// "auth/wrong-password", "auth/email-already-in-use") so callers can map it
// to a localized message.
export class EmailAuthError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

function toEmailAuthError(error: unknown): EmailAuthError {
  const code = (error as { code?: string }).code;
  return code ? new EmailAuthError(code) : new EmailAuthError("auth/unknown", (error as Error).message);
}

export async function signInWithEmail(email: string, password: string): Promise<string> {
  const auth = await getAuthInstance();
  const { signInWithEmailAndPassword } = await import("firebase/auth");

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await result.user.getIdToken();
  } catch (error) {
    throw toEmailAuthError(error);
  }
}

export async function registerWithEmail(email: string, password: string, name: string): Promise<string> {
  const auth = await getAuthInstance();
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    // Force a refresh so the ID token's `name` claim reflects the
    // displayName just set — otherwise the backend would create the account
    // with the generic "Utilisateur" fallback (see AuthController::social).
    return await result.user.getIdToken(true);
  } catch (error) {
    throw toEmailAuthError(error);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = await getAuthInstance();
  const { sendPasswordResetEmail } = await import("firebase/auth");

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw toEmailAuthError(error);
  }
}
