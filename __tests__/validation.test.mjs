import test from 'node:test';
import assert from 'node:assert';
import { validateInput } from '../lib/validation.mjs';

test('Input Validation Tests', async (t) => {
  await t.test('returns true for completely valid input', () => {
    const input = {
      city: 'Kolkata',
      familySize: 4,
      housingType: 'Apartment',
      concerns: ['Flooding', 'Power Outages'],
      language: 'English'
    };

    const res = validateInput(input);
    assert.strictEqual(res.isValid, true);
    assert.deepStrictEqual(res.errors, {});
    assert.strictEqual(res.sanitized.city, 'Kolkata');
    assert.strictEqual(res.sanitized.familySize, 4);
    assert.strictEqual(res.sanitized.housingType, 'Apartment');
    assert.deepStrictEqual(res.sanitized.concerns, ['Flooding', 'Power Outages']);
    assert.strictEqual(res.sanitized.language, 'English');
  });

  await t.test('validates missing city name', () => {
    const input = {
      city: '   ',
      familySize: 4,
      housingType: 'Apartment',
      concerns: ['Flooding'],
      language: 'English'
    };

    const res = validateInput(input);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.errors.city, 'City/Region is required.');
  });

  await t.test('validates excessively long city name', () => {
    const input = {
      city: 'a'.repeat(101),
      familySize: 4,
      housingType: 'Apartment',
      concerns: ['Flooding'],
      language: 'English'
    };

    const res = validateInput(input);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.errors.city, 'City name must be under 100 characters.');
  });

  await t.test('validates invalid family sizes', () => {
    const input = {
      city: 'Mumbai',
      familySize: 25,
      housingType: 'Apartment',
      concerns: ['Flooding'],
      language: 'English'
    };

    const res1 = validateInput(input);
    assert.strictEqual(res1.isValid, false);
    assert.strictEqual(res1.errors.familySize, 'Family size must be between 1 and 20.');

    const res2 = validateInput({ ...input, familySize: -2 });
    assert.strictEqual(res2.isValid, false);
    assert.strictEqual(res2.errors.familySize, 'Family size must be between 1 and 20.');
  });

  await t.test('validates invalid housing types', () => {
    const input = {
      city: 'Mumbai',
      familySize: 4,
      housingType: 'Skyscraper Penthouse',
      concerns: ['Flooding'],
      language: 'English'
    };

    const res = validateInput(input);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.errors.housingType, 'Invalid housing type.');
  });

  await t.test('validates empty concerns list', () => {
    const input = {
      city: 'Mumbai',
      familySize: 4,
      housingType: 'Apartment',
      concerns: [],
      language: 'English'
    };

    const res = validateInput(input);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.errors.concerns, 'Please select at least one concern.');
  });

  await t.test('handles fallback logic for language parameter', () => {
    const input = {
      city: 'Chennai',
      familySize: 2,
      housingType: 'Independent House',
      concerns: ['Water Contamination'],
      language: ''
    };

    const res = validateInput(input);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.sanitized.language, 'English');
  });
});
