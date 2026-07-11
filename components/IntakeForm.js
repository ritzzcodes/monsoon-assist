'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './IntakeForm.module.css';
import LanguageSelector from './LanguageSelector';
import LoadingSpinner from './LoadingSpinner';
import PlanDisplay from './PlanDisplay';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 
  'Ranchi', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Gwalior', 'Jabalpur', 
  'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 
  'Chandigarh', 'Dehradun', 'Kochi', 'Bhubaneswar', 'Thiruvananthapuram', 'Panaji'
];

const HOUSING_TYPES = [
  'Apartment',
  'Independent House',
  'Ground Floor',
  'Slum / Kutcha House',
  'Other',
];

const CONCERNS = [
  { id: 'flooding', label: '🌊 Flooding', value: 'Flooding' },
  { id: 'water-contamination', label: '💧 Water Contamination', value: 'Water Contamination' },
  { id: 'power-outages', label: '⚡ Power Outages', value: 'Power Outages' },
  { id: 'roof-leaks', label: '🏠 Roof Leaks', value: 'Roof Leaks' },
  { id: 'disease', label: '🦟 Disease / Mosquitoes', value: 'Disease/Mosquitoes' },
  { id: 'travel', label: '🚗 Travel Disruption', value: 'Travel Disruption' },
  { id: 'agriculture', label: '🌾 Livestock / Agriculture', value: 'Livestock/Agriculture' },
  { id: 'vulnerable', label: '👶 Elderly / Children Safety', value: 'Elderly/Children Safety' },
];

export default function IntakeForm() {
  const [formData, setFormData] = useState({
    city: '',
    familySize: 4,
    housingType: 'Apartment',
    concerns: [],
    language: 'English',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [apiError, setApiError] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const comboboxRef = useRef(null);

  const filteredCities = INDIAN_CITIES.filter((city) =>
    city.toLowerCase().includes(formData.city.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectCity = (city) => {
    setFormData((prev) => ({ ...prev, city }));
    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % Math.max(1, filteredCities.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + filteredCities.length) % Math.max(1, filteredCities.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCities.length) {
          selectCity(filteredCities[focusedIndex]);
        } else {
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };


  const validate = () => {
    const newErrors = {};
    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city or region';
    } else if (formData.city.trim().length > 100) {
      newErrors.city = 'City name must be under 100 characters';
    }
    if (formData.familySize < 1 || formData.familySize > 20) {
      newErrors.familySize = 'Family size must be between 1 and 20';
    }
    if (formData.concerns.length === 0) {
      newErrors.concerns = 'Please select at least one concern';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleConcern = (value) => {
    setFormData((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(value)
        ? prev.concerns.filter((c) => c !== value)
        : [...prev.concerns, value],
    }));
    if (errors.concerns) {
      setErrors((prev) => ({ ...prev, concerns: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setPlan(data);

      setTimeout(() => {
        document.getElementById('plan-output')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setApiError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (plan) {
    return (
      <div id="plan-output" aria-live="polite">
        <PlanDisplay plan={plan} onReset={handleReset} city={formData.city} />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className={styles.formSection} id="main-content">
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Tell Us About Your Family</h2>
        <p className={styles.sectionSubtitle}>
          We&apos;ll create a personalized monsoon preparedness plan tailored to your needs.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
              Family Information
            </legend>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="city-input" className={styles.label}>
                  📍 Your City / Region
                </label>
                <div className={styles.comboboxContainer} ref={comboboxRef}>
                  <input
                    type="text"
                    id="city-input"
                    className={`${styles.input} ${errors.city ? styles.errorBorder : ''}`}
                    placeholder="Search city e.g. Mumbai, Delhi..."
                    value={formData.city}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, city: e.target.value }));
                      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                      setIsOpen(true);
                      setFocusedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    maxLength={100}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                    autoComplete="off"
                  />
                  {isOpen && (
                    <ul className={styles.dropdownList} role="listbox">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city, idx) => (
                          <li
                            key={city}
                            id={`city-option-${idx}`}
                            className={`${styles.dropdownItem} ${
                              focusedIndex === idx ? styles.dropdownItemFocused : ''
                            }`}
                            onClick={() => selectCity(city)}
                            role="option"
                            aria-selected={focusedIndex === idx}
                          >
                            {city}
                          </li>
                        ))
                      ) : (
                        formData.city.trim() && (
                          <li className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                            Use custom: &quot;{formData.city}&quot;
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
                {errors.city && (
                  <span id="city-error" className={styles.error} role="alert">
                    {errors.city}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="family-size-input" className={styles.label}>
                  👨‍👩‍👧‍👦 Family Size
                </label>
                <input
                  type="number"
                  id="family-size-input"
                  className={`${styles.input} ${errors.familySize ? styles.errorBorder : ''}`}
                  min={1}
                  max={20}
                  value={formData.familySize}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, familySize: parseInt(e.target.value) || 1 }))
                  }
                  required
                  aria-required="true"
                  aria-invalid={!!errors.familySize}
                  aria-describedby={errors.familySize ? 'family-error' : undefined}
                />
                {errors.familySize && (
                  <span id="family-error" className={styles.error} role="alert">
                    {errors.familySize}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="housing-select" className={styles.label}>
                  🏠 Housing Type
                </label>
                <select
                  id="housing-select"
                  className={styles.select}
                  value={formData.housingType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, housingType: e.target.value }))
                  }
                >
                  {HOUSING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.languageRow}>
                <LanguageSelector
                  value={formData.language}
                  onChange={(val) => setFormData((prev) => ({ ...prev, language: val }))}
                />
              </div>

              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>
                  ⚠️ Specific Concerns
                </label>
                <div className={styles.checkboxGrid} role="group" aria-label="Select your specific concerns">
                  {CONCERNS.map((concern) => {
                    const isChecked = formData.concerns.includes(concern.value);
                    return (
                      <label
                        key={concern.id}
                        className={`${styles.checkboxLabel} ${isChecked ? styles.checkboxLabelChecked : ''}`}
                        htmlFor={`concern-${concern.id}`}
                      >
                        <input
                          type="checkbox"
                          id={`concern-${concern.id}`}
                          className={styles.hiddenCheckbox}
                          checked={isChecked}
                          onChange={() => toggleConcern(concern.value)}
                          aria-label={concern.value}
                        />
                        <span className={`${styles.customCheck} ${isChecked ? styles.customCheckActive : ''}`}>
                          {isChecked ? '✓' : ''}
                        </span>
                        {concern.label}
                      </label>
                    );
                  })}
                </div>
                {errors.concerns && (
                  <span className={styles.error} role="alert">
                    {errors.concerns}
                  </span>
                )}
              </div>
            </div>

            {apiError && (
              <div className={styles.error} role="alert" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
                ❌ {apiError}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              aria-label="Generate your personalized monsoon preparedness plan"
            >
              Generate My Monsoon Plan ⚡
            </button>
          </fieldset>
        </form>
      </div>
    </section>
  );
}
