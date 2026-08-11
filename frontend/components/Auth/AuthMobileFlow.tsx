"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiValidationError, login, register } from "@/lib/api";
import { saveSession } from "@/lib/auth";
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
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const formsTrackRef = useRef<HTMLDivElement>(null);
  const [formMode, setFormMode] = useState<"login" | "signup">(initialMode);

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

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

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { user, token } = await login(loginPhone, loginPassword, "Shopitech PWA (mobile)");
      saveSession({ user, token });
      router.push("/compte");
    } catch (err) {
      const message =
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : "Une erreur est survenue. Réessayez.";
      setLoginError(message);
      setLoginLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);
    try {
      const { user, token } = await register(signupName, signupPhone, signupPassword, signupConfirmPassword);
      saveSession({ user, token });
      router.push("/compte");
    } catch (err) {
      const message =
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : "Une erreur est survenue. Réessayez.";
      setSignupError(message);
      setSignupLoading(false);
    }
  }

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
          <span className={styles.welcomeHeadlineDark}>Swipe up</span> to
          <span className={styles.welcomeHeadlineLight}> explore the word of shopping.</span>
        </h1>

        <button type="button" className={styles.swipeHint} onClick={openSheet} aria-label="Se connecter / S'inscrire">
          <img src="/icon/auth/chevron-up-triple.svg" alt="" className={styles.swipeChevron} />
        </button>
      </section>

      <section className={styles.formsSlide}>
        <div className={styles.formsHeader}>
          <p className={styles.formsHello}>Hello.</p>
          <p className={styles.formsWelcome}>{formMode === "login" ? "Welcome back!" : "Welcome!"}</p>
        </div>

        <div className={styles.sheet}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon/auth/scroll-line.svg" alt="" className={styles.sheetHandle} />

          <div className={styles.formsTrack} ref={formsTrackRef} onScroll={handleFormsScroll}>
            <form className={styles.formSlide} onSubmit={handleLoginSubmit}>
              <p className={styles.sheetTitle}>Enter to your account</p>

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Phone number
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

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Password
                </span>
                <div className={styles.passwordBox}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={styles.passwordInput}
                  />
                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={showLoginPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    <img src="/icon/auth/visibility.svg" alt="" className={styles.visibilityIcon} />
                  </button>
                </div>
              </label>

              <button type="button" className={styles.forgotLink}>
                forgot password?
              </button>

              {loginError && <p className={styles.formError}>{loginError}</p>}

              <button type="submit" className={styles.submitButton} disabled={loginLoading}>
                <span>{loginLoading ? "Connexion..." : "Login"}</span>
              </button>

              <p className={styles.switchLine}>
                Don&apos;t have an account ?{" "}
                <button type="button" className={styles.switchLink} onClick={() => goToForm("signup")}>
                  Sign up
                </button>
              </p>
            </form>

            <form className={styles.formSlide} onSubmit={handleSignupSubmit}>
              <p className={styles.sheetTitle}>Create your account</p>

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Full name
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

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Phone number
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

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Password
                </span>
                <div className={styles.passwordBox}>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Enter your password..."
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={styles.passwordInput}
                  />
                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => setShowSignupPassword((v) => !v)}
                    aria-label={showSignupPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    <img src="/icon/auth/visibility.svg" alt="" className={styles.visibilityIcon} />
                  </button>
                </div>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Confirm password
                </span>
                <input
                  type={showSignupPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your password..."
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </label>

              {signupError && <p className={styles.formError}>{signupError}</p>}

              <button type="submit" className={styles.submitButton} disabled={signupLoading}>
                <span>{signupLoading ? "Création..." : "Sign up"}</span>
              </button>

              <p className={styles.switchLine}>
                Already have an account ?{" "}
                <button type="button" className={styles.switchLink} onClick={() => goToForm("login")}>
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
