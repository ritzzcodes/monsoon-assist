import styles from './LanguageSelector.module.css';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor="language-select" className={styles.label}>
        🌐 Response Language
      </label>
      <select
        id="language-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select response language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.name}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
