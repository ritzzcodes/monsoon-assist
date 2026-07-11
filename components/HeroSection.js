import styles from './HeroSection.module.css';

export default function HeroSection() {
  const raindrops = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${1.5 + Math.random() * 2}s`,
    animationDelay: `${Math.random() * 3}s`,
    height: `${15 + Math.random() * 20}px`,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <section className={styles.hero} aria-label="Hero section">
      <div className={styles.rainContainer} aria-hidden="true">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className={styles.raindrop}
            style={{
              left: drop.left,
              animationDuration: drop.animationDuration,
              animationDelay: drop.animationDelay,
              height: drop.height,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>MonsoonReady</h1>
        <p className={styles.subtitle}>
          AI-Powered Monsoon Preparedness for Every Family
        </p>
        <span className={styles.badge}>
          ✨ Powered by Google Gemini
        </span>
      </div>
    </section>
  );
}
