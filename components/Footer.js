import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Built for PromptWars Hackathon 2025</p>
      <span className={styles.gemini}>🤖 Powered by Google Gemini</span>
      <p className={styles.disclaimer}>
        Disclaimer: MonsoonReady provides AI-generated guidance for informational purposes only.
        Always follow official government advisories and local authority instructions during emergencies.
      </p>
    </footer>
  );
}
