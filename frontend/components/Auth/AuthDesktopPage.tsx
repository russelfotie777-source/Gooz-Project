"use client";

import { useState } from "react";
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
import styles from "./AuthDesktopPage.module.css";

interface AuthDesktopPageProps {
  mode: "login" | "signup";
}

// Figma desktop: connexion 1127:613, inscription 1127:649. Both routes
// (/connexion, /inscription) render this same two-pane layout with a
// different `mode` — switching between them animates the right-hand form
// out to the left, then the destination page's form slides in from the
// right (see .exiting / formEnter below). Copy is localized to French with
// some creative license on the headlines/quote (approved by the user), not
// a literal translation of the Figma placeholder text.
export default function AuthDesktopPage({ mode }: AuthDesktopPageProps) {
  const dict = useDictionary();
  const router = useLocaleRouter();
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const errorRef = useFocusOnError<HTMLParagraphElement>(error);

  const targetHref = mode === "login" ? "/inscription" : "/connexion";

  function handleSwitch(e: React.MouseEvent) {
    e.preventDefault();
    setExiting(true);
    window.setTimeout(() => router.push(targetHref), 260);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError(dict.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      if (authMode === "email") {
        const idToken =
          mode === "login" ? await signInWithEmail(email, password) : await registerWithEmail(email, password, name);
        const { user, token } = await socialLogin(idToken, "Shopitech PWA (desktop)");
        saveSession({ user, token });
        notifyLogin();
        router.push("/compte");
        return;
      }

      const { user, token } =
        mode === "login"
          ? await login(phone, password, "Shopitech PWA (desktop)")
          : await register(name, phone, password, confirmPassword);
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
      setError(message);
      setLoading(false);
    }
  }

  async function handleSocialSignIn(providerId: "google" | "facebook") {
    setError(null);
    setSocialLoading(providerId);
    try {
      const idToken = await (providerId === "google" ? signInWithGoogle() : signInWithFacebook());
      const { user, token } = await socialLogin(idToken, "Shopitech PWA (desktop)");
      saveSession({ user, token });
      notifyLogin();
      router.push("/compte");
    } catch (err) {
      if (err instanceof SocialSignInCancelledError) return;
      const message =
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : dict.auth.socialError;
      setError(message);
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <div className={`${styles.page} ${exiting ? styles.exiting : ""}`}>
      <div className={styles.leftPanel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/auth/skyline.png" alt="" className={styles.skyline} />

        <div className={styles.leftContent}>
          <h1 className={styles.leftHeadline}>
            <span className={styles.leftHeadlineDark}>{dict.auth.leftHeadlineDark(mode)}</span>
            <br />
            {dict.auth.leftHeadlineRest}
          </h1>
          <p className={styles.quote}>{dict.auth.quote}</p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        {/* These two patches paint the S-curve seam: the orange panel stays a
            plain rectangle and these radial-gradient corners create the
            illusion of it curving away (top) / bulging in (bottom) — see
            the module CSS for the geometry. */}
        <span className={styles.topNotch} aria-hidden="true" />
        <span className={styles.bottomNotch} aria-hidden="true" />

        <div className={styles.rightPanelScroll}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-shopitech-primaire/logoFichier 5version F.png"
            alt="Shopitech"
            className={styles.logo}
          />

          <div className={styles.formWrap}>
          <h2 className={styles.formHeadline}>
            {dict.auth.hello}
            <br />
            <span>{mode === "login" ? dict.auth.welcomeBack : dict.auth.welcomeNew}</span>
          </h2>

          <form className={styles.form} onSubmit={handleSubmit}>
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

            {mode === "signup" && (
              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.fullName}
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </label>
            )}

            {authMode === "phone" ? (
              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.phoneNumber}
                </span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  className={styles.visibilityButton}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? dict.auth.hidePassword : dict.auth.showPassword}
                >
                  <span
                    className={`${styles.visibilityIconWrapper} ${showPassword ? "" : styles.visibilityIconCrossed}`}
                  >
                    <img src="/icon/auth/visibility.svg" alt="" className={styles.visibilityIcon} />
                  </span>
                </button>
              </div>
            </label>

            {mode === "signup" && (
              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>{dict.auth.confirmPassword}
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </label>
            )}

            <div className={styles.bottomRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={styles.checkbox}
                />
                {dict.auth.rememberMe}
              </label>

              {mode === "login" && authMode === "email" && (
                <button type="button" className={styles.forgotButton} onClick={() => setForgotOpen(true)}>
                  {dict.auth.forgotPassword}
                  <img src="/icon/auth/arrow-forward.svg" alt="" className={styles.forgotArrow} />
                </button>
              )}
            </div>

            {error && (
              <p ref={errorRef} tabIndex={-1} className={styles.formError} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              <span>{loading ? dict.auth.connecting : mode === "login" ? dict.auth.login : dict.auth.signup}</span>
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <em className={styles.dividerLabel}>{dict.auth.or}</em>
              <span className={styles.dividerLine} />
            </div>

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

            <p className={styles.switchLine}>
              {mode === "login" ? dict.auth.dontHaveAccount : dict.auth.alreadyHaveAccount}
              <a href={targetHref} className={styles.switchLink} onClick={handleSwitch}>
                {mode === "login" ? dict.auth.signUpLink : dict.auth.signInLink}
              </a>
            </p>
          </form>
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} initialEmail={email} />
    </div>
  );
}
