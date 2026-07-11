import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true"></div>
      <p className={styles.text}>Generating your personalized plan...</p>
      <p className={styles.subtext}>This may take a few seconds</p>
    </div>
  );
}
