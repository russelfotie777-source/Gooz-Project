import styles from "./loading.module.css";

// Plain Server Component on purpose (no dict/context dependency) — this is
// the fallback Suspense shows the instant a server page starts rendering,
// so it needs to be as dependency-free as possible rather than waiting on
// anything that could itself fail.
export default function RootLoading() {
  return (
    <div className={styles.page}>
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
