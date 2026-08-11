"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiValidationError, login, register } from "@/lib/api";
import { saveSession } from "@/lib/auth";
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
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetHref = mode === "login" ? "/inscription" : "/connexion";

  function handleSwitch(e: React.MouseEvent) {
    e.preventDefault();
    setExiting(true);
    window.setTimeout(() => router.push(targetHref), 260);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user, token } =
        mode === "login"
          ? await login(phone, password, "Shopitech PWA (desktop)")
          : await register(name, phone, password, confirmPassword);
      saveSession({ user, token });
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiValidationError
          ? (Object.values(err.errors)[0]?.[0] ?? err.message)
          : "Une erreur est survenue. Réessayez.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.page} ${exiting ? styles.exiting : ""}`}>
      <div className={styles.leftPanel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/auth/skyline.png" alt="" className={styles.skyline} />

        <div className={styles.leftContent}>
          <h1 className={styles.leftHeadline}>
            <span className={styles.leftHeadlineDark}>
              {mode === "login" ? "Connectez-vous" : "Inscrivez-vous"}
            </span>
            <br />
            et plongez dans
            <br />
            l&apos;univers du shopping.
          </h1>
          <p className={styles.quote}>&quot;Construire ensemble une expérience qui compte.&quot;</p>
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
            Bonjour,
            <br />
            <span>{mode === "login" ? "ravi de vous revoir !" : "bienvenue parmi nous !"}</span>
          </h2>

          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Nom complet
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

            <label className={styles.field}>
              <span className={styles.label}>
                <span className={styles.required}>*</span>Numéro de téléphone
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

            <label className={styles.field}>
              <span className={styles.label}>
                <span className={styles.required}>*</span>Mot de passe
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
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <img src="/icon/auth/visibility.svg" alt="" className={styles.visibilityIcon} />
                </button>
              </div>
            </label>

            {mode === "signup" && (
              <label className={styles.field}>
                <span className={styles.label}>
                  <span className={styles.required}>*</span>Confirmer le mot de passe
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
                Se souvenir de moi pendant 30 jours
              </label>

              {mode === "login" && (
                <button type="button" className={styles.forgotButton}>
                  Mot de passe oublié ?
                  <img src="/icon/auth/arrow-forward.svg" alt="" className={styles.forgotArrow} />
                </button>
              )}
            </div>

            {error && <p className={styles.formError}>{error}</p>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              <span>{loading ? "Connexion..." : mode === "login" ? "Se connecter" : "S'inscrire"}</span>
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <em className={styles.dividerLabel}>ou</em>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.snsRow}>
              <button type="button" className={styles.snsButton} aria-label="Continuer avec Google">
                <img src="/icon/auth/google.svg" alt="" className={styles.snsIcon} />
              </button>
              <button type="button" className={styles.snsButtonFull} aria-label="Continuer avec Facebook">
                <img src="/icon/auth/facebook.svg" alt="" className={styles.snsIconFull} />
              </button>
              <button type="button" className={styles.snsButtonFull} aria-label="Continuer avec Apple">
                <img src="/icon/auth/apple.svg" alt="" className={styles.snsIconFull} />
              </button>
            </div>

            <p className={styles.switchLine}>
              {mode === "login" ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
              <a href={targetHref} className={styles.switchLink} onClick={handleSwitch}>
                {mode === "login" ? "Inscrivez-vous" : "Connectez-vous"}
              </a>
            </p>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
