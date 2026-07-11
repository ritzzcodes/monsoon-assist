'use client';

import { useState, useEffect } from 'react';
import styles from './ChecklistItem.module.css';

export default function ChecklistItem({ id, label }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`checklist-${id}`);
    if (saved === 'true') {
      setChecked(true);
    }
  }, [id]);

  const handleChange = () => {
    const newValue = !checked;
    setChecked(newValue);
    localStorage.setItem(`checklist-${id}`, String(newValue));
  };

  return (
    <div className={styles.item} onClick={handleChange}>
      <input
        type="checkbox"
        id={`check-${id}`}
        className={styles.checkbox}
        checked={checked}
        onChange={handleChange}
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      />
      <label
        htmlFor={`check-${id}`}
        className={`${styles.label} ${checked ? styles.checked : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </label>
    </div>
  );
}
