export function validateInput({ city, familySize, housingType, concerns, language }) {
  const errors = {};

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    errors.city = 'City/Region is required.';
  } else if (city.trim().length > 100) {
    errors.city = 'City name must be under 100 characters.';
  }

  const size = parseInt(familySize);
  if (isNaN(size) || size < 1 || size > 20) {
    errors.familySize = 'Family size must be between 1 and 20.';
  }

  const validHousingTypes = ['Apartment', 'Independent House', 'Ground Floor', 'Slum / Kutcha House', 'Other'];
  if (!housingType || !validHousingTypes.includes(housingType)) {
    errors.housingType = 'Invalid housing type.';
  }

  if (!Array.isArray(concerns) || concerns.length === 0) {
    errors.concerns = 'Please select at least one concern.';
  } else {
    const concernsStr = concerns.join(', ');
    if (concernsStr.length > 500) {
      errors.concerns = 'Concerns text is too long.';
    }
  }

  const validLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Odia', 'Punjabi', 'Assamese', 'Urdu'];
  if (language && !validLanguages.includes(language)) {
    errors.language = 'Invalid language.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      city: city ? city.trim() : '',
      familySize: size,
      housingType,
      concerns,
      language: language || 'English'
    }
  };
}
