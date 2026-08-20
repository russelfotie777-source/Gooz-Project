"use client";

import { useEffect, useRef, useState } from "react";
import { ApiValidationError, login, register, socialLogin } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { notifyLogin } from "@/lib/authEvents";
import {
  EmailAuthError,
  registerWithEmail,
  signInWithEmail,
  SocialSignInCancelledError,
  signInWithFacebook,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { useLocaleRouter } from "@/lib/i18n/useLocaleRouter";
import { useFocusOnError } from "@/lib/useFocusOnError";
import ForgotPasswordModal from "./ForgotPasswordModal";
import styles from "./AuthMobileFlow.module.css";

interface AuthMobileFlowProps {
  initialMode: "login" | "signup";
}

// Figma mobile: accueil 1089:912, connexion 1089:935, inscription 1089:958.
// One continuous vertical scroll-snap track (welcome -> forms) plus a nested
// horizontal scroll-snap track inside the sheet (login <-> signup) — same
// native-scroll-as-gesture technique already used for the ProductDetail
// image gallery, so swipe-up / swipe-sideways both come for free.
export default function AuthMobileFlow({ initialMode }: AuthMobileFlowProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const formsTrackRef = useRef<HTMLDivElement>(null);
  const [formMode, setFormMode] = useState<"login" | "signup">(initialMode);
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [forgotOpen, setForgotOpen] = useState(false);

  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  // Not the socialError paragraph too: socialSection below is shared JSX
  // rendered into BOTH forms at once (this is one continuous scroll-snap
  // document, not real navigation, so both copies exist in the DOM
  // simultaneously) — a single ref can only ever land on one of the two
  // copies, so it can't reliably move focus to "the one that's showing".
  const [socialError, setSocialError] = useState<string | null>(null);
  const loginErrorRef = useFocusOnError<HTMLParagraphElement>(loginError);
  const signupErrorRef = useFocusOnError<HTMLParagraphElement>(signupError);

  useEffect(() => {
    if (initialMode !== "signup") return;
    viewportRef.current?.scrollTo({ top: viewportRef.current.clientHeight });
    formsTrackRef.current?.scrollTo({ left: formsTrackRef.current.clientWidth });
  }, [initialMode]);

  function openSheet() {
    viewportRef.current?.scrollTo({ top: viewportRef.current.clientHeight, behavior: "smooth" });
  }

  function goToForm(mode: "login" | "signup") {
    setFormMode(mode);
    const el = formsTrackRef.current;
    if (el) el.scrollTo({ left: mode === "signup" ? el.clientWidth : 0, behavior: "smooth" });
  }

  function handleFormsScroll() {
    const el = formsTrackRef.current;
    if (!el || el.clientWidth === 0) return;
    setFormMode(Math.round(el.scrollLeft / el.clientWidth) === 1 ? "signup" : "login");
  }

  function mapEmailAuthError(code: string): string {
    switch (code) {
      case "auth/email-already-in-use":
        return dict.auth.emailInUse;
      case "auth/weak-password":
        return dict.auth.weakPassword;
      case "auth/invalid-email":
        return dict.auth.invalidEmail;
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return dict.auth.emailAuthError;
      default:
        return dict.auth.genericError;
    }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      if (authMode === "email") {
        const idToken = await signInWithEmail(loginEmail, loginPassword);
        const { user, token } = await socialLogin(idToken, "Shopitech PWA (mobile)");
        saveSession({ user, token });
        notifyLogin();
        router.push("/compte");
        return;
      }

      const { user, token } = await login(loginPhone, loginPassword, "Shopitech PWA (mobile)");
      saveSession({ user, token });
      notifyLogin();
      router.push("/compte");
    } catch (err) {
      const message =
        err instanceof EmailAuthError
          ? mapEmailAuthError(err.code)
          : err instanceof ApiValidationError
            ? (Object.values(err.errors)[0]?.[0] ?? err.message)
            : dict.auth.genericError;
      setLoginError(message);
      setLoginLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword !== signupConfirmPassword) {
      setSignupError(dict.auth.passwordMismatch);
      return;
    }

    setSignupLoading(true);
    try {
      if (authMode === "email") {
        const idToken = await registerWithEmail(signupEmail, signupPassword, signupName);
        const { user, token } = await socialLogin(idToken, "Shopitech PWA (mobile)");
        saveSession({ user, token });
        notifyLogin();
        router.push("/compte");
        return;
      }

      const { user, token } = await register(signupName, signupPhone, signupPassword, signupConfirmPassword);
      saveSession({ user, token });
      notifyLogin();
      router.push("/compte");
    } catch (err) {
      const message =
        err instanceof EmailAuthError
          ? mapEmailAuthError(err.code)
          : err instanceof ApiValidationError
            ? (Object.values(err.errors)[0]?.[0] ?? err.message)
            : dict.auth.genericError;
      setSignupError(message);
      setSignupLoading(false);
    }
  }

  async function handleSocialSignIn(providerId: "google" | "facebook") {
    setSocialError(null);
    setSocialLoading(providerId);
    try {
      const idToken = await (providerId === "google" ? signInWithGoogle() : signInWithFacebook());
      const { user, token } = await socialLogin(idToken, "Shopitech PWA (mobile)");
      saveSession({ user, token });
      notifyLogin();
      router.push("/compte");
    } catch (err) {
      if (err instanceof SocialSignInCancelledError) return;
      const message =
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.auth.socialError;
      setSocialError(message);
    } finally {
      setSocialLoading(null);
    }
  }

  const socialSection = (
    <>
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <em className={styles.dividerLabel}>{dict.auth.or}</em>
        <span className={styles.dividerLine} />
      </div>

      {socialError && (
        <p className={styles.formError} role="alert">
          {socialError}
        </p>
      )}

      <div className={styles.snsRow}>
        <button
          type="button"
          className={styles.snsButton}
          aria-label={dict.auth.continueWithGoogle}
          disabled={socialLoading !== null}
          onClick={() => handleSocialSignIn("google")}
        >
          <img src="/icon/auth/google.svg" alt="" className={styles.snsIcon} />
        </button>
        <button
          type="button"
          className={styles.snsButtonFull}
          aria-label={dict.auth.continueWithFacebook}
          disabled={socialLoading !== null}
          onClick={() => handleSocialSignIn("facebook")}
        >
          <img src="/icon/auth/facebook.svg" alt="" className={styles.snsIconFull} />
        </button>
        <button
          type="button"
          className={styles.snsButtonFull}
          aria-label={dict.auth.continueWithApple}
          title={dict.auth.appleComingSoon}
          disabled
        >
          <img src="/icon/auth/apple.svg" alt="" className={styles.snsIconFull} />
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.viewport} ref={viewportRef}>
      {/* Shared background image: a single element spanning both slides so
          it scrolls continuously with the page — the welcome slide shows
          its main body, and scrolling into the forms slide reveals only
          its bottom edge peeking at the top, matching the Figma source
          (same asset, just cropped differently per screen). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/auth/water-distributor.png" alt="" className={styles.welcomeImage} />

      <section className={styles.welcomeSlide}>
        <h1 className={styles.welcomeHeadline}>
          <span className={styles.welcomeHeadlineDark}>{dict.auth.welcomeSwipeDark}</span>
          <span className={styles.welcomeHeadlineLight}>{dict.auth.welcomeSwipeLight}</span>
        </h1>

        <button type="button" className={styles.swipeHint} onClick={openSheet} aria-label={dict.header.login}>
          <img src="/icon/auth/chevron-up-triple.svg" alt="" className={styles.swipeChevron} />
        </button>
      </section>

      <section className={styles.formsSlide}>
        <div className={styles.formsHeader}>
          <p className={styles.formsHello}>{dict.auth.hello}</p>
          <p className={styles.formsWelcome}>{formMode === "login" ? dict.auth.welcomeBack : dict.auth.welcomeNew}</p>
        </div>

        <div className={styles.sheet}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon/auth/scroll-line.svg" alt="" className={styles.sheetHandle} />

          <div className={styles.formsTrack} ref={formsTrackRef} onScroll={handleFormsScroll}>
            <form className={styles.formSlide} onSubmit={handleLoginSubmit}>
              <p className={styles.sheetTitle}>{dict.auth.enterAccount}</p>

              <div className={styles.modeTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "phone"}
                  className={`${styles.modeTab} ${authMode === "phone" ? styles.modeTabActive : ""}`}
                  onClick={() => setAuthMode("phone")}
                >
                  {dict.auth.phoneTab}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "email"}
                  className={`${styles.modeTab} ${authMode === "email" ? styles.modeTabActive : ""}`}
                  onClick={() => setAuthMode("email")}
                >
                  {dict.auth.emailTab}
                </button>
              </div>

              {authMode === "phone" ? (
                <label className={styles.field}>
                  <span className={styles.label}>
                    <span className={styles.required}>*</span>{dict.auth.phoneNumber}
                  </span>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className={styles.input}
                  />
                </label>
              ) : (
                <label className={styles.field}>
                  <span className={styles.label}>
                    <span className={styles.required}>*</span>{dict.auth.emailAddress}
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={styles.input}
                  />
                </label>
              )}

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.password}
                </span>
                <div className={styles.passwordBox}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder={dict.auth.enterPasswordPlaceholder}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={styles.passwordInput}
                  />
                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={showLoginPassword ? dict.auth.hidePassword : dict.auth.showPassword}
                  >
                    <span
                      className={`${styles.visibilityIconWrapper} ${showLoginPassword ? "" : styles.visibilityIconCrossed}`}
                    >
                      <img src="/icon/auth/visibility.svg" alt="" className={styles.visibilityIcon} />
                    </span>
                  </button>
                </div>
              </label>

              {authMode === "email" && (
                <button type="button" className={styles.forgotLink} onClick={() => setForgotOpen(true)}>
                  {dict.auth.forgotPassword}
                </button>
              )}

              {loginError && (
                <p ref={loginErrorRef} tabIndex={-1} className={styles.formError} role="alert">
                  {loginError}
                </p>
              )}

              <button type="submit" className={styles.submitButton} disabled={loginLoading}>
                <span>{loginLoading ? dict.auth.connecting : dict.auth.login}</span>
              </button>

              {socialSection}

              <p className={styles.switchLine}>
                {dict.auth.dontHaveAccount}
                <button type="button" className={styles.switchLink} onClick={() => goToForm("signup")}>
                  {dict.auth.signUpLink}
                </button>
              </p>
            </form>

            <form className={styles.formSlide} onSubmit={handleSignupSubmit}>
              <p className={styles.sheetTitle}>{dict.auth.createAccount}</p>

              <div className={styles.modeTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "phone"}
                  className={`${styles.modeTab} ${authMode === "phone" ? styles.modeTabActive : ""}`}
                  onClick={() => setAuthMode("phone")}
                >
                  {dict.auth.phoneTab}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "email"}
                  className={`${styles.modeTab} ${authMode === "email" ? styles.modeTabActive : ""}`}
                  onClick={() => setAuthMode("email")}
                >
                  {dict.auth.emailTab}
                </button>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.fullName}
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className={styles.input}
                />
              </label>

              {authMode === "phone" ? (
                <label className={styles.field}>
                  <span className={styles.label}>
                    <span className={styles.required}>*</span>{dict.auth.phoneNumber}
                  </span>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className={styles.input}
                  />
                </label>
              ) : (
                <label className={styles.field}>
                  <span className={styles.label}>
                    <span className={styles.required}>*</span>{dict.auth.emailAddress}
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className={styles.input}
                  />
                </label>
              )}

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.password}
                </span>
                <div className={styles.passwordBox}>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder={dict.auth.enterPasswordPlaceholder}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={styles.passwordInput}
                  />
                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => setShowSignupPassword((v) => !v)}
                    aria-label={showSignupPassword ? dict.auth.hidePassword : dict.auth.showPassword}
                  >
                    <span
                      className={`${styles.visibilityIconWrapper} ${showSignupPassword ? "" : styles.visibilityIconCrossed}`}
                    >
                      <img src="/icon/auth/visibility.svg" alt="" className={styles.visibilityIcon} />
                    </span>
                  </button>
                </div>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.confirmPassword}
                </span>
                <input
                  type={showSignupPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder={dict.auth.confirmPasswordPlaceholder}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </label>

              {signupError && (
                <p ref={signupErrorRef} tabIndex={-1} className={styles.formError} role="alert">
                  {signupError}
                </p>
              )}

              <button type="submit" className={styles.submitButton} disabled={signupLoading}>
                <span>{signupLoading ? dict.auth.creating : dict.auth.signup}</span>
              </button>

              {socialSection}

              <p className={styles.switchLine}>
                {dict.auth.alreadyHaveAccount}
                <button type="button" className={styles.switchLink} onClick={() => goToForm("login")}>
                  {dict.auth.signInLink}
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} initialEmail={loginEmail} />
    </div>
  );
}
