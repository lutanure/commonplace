import { sanitizeDisabledTypes } from './typeVisibility';

describe('sanitizeDisabledTypes', () => {
  it('keeps valid built-in type values', () => {
    expect(sanitizeDisabledTypes(['article', 'movie'])).toEqual([
      'article',
      'movie',
    ]);
  });

  it('drops "other" — it is never toggleable', () => {
    expect(sanitizeDisabledTypes(['other', 'movie'])).toEqual(['movie']);
  });

  it('drops values that are not real item types', () => {
    expect(sanitizeDisabledTypes(['not-a-type', 'movie'])).toEqual(['movie']);
  });

  it('drops malformed entries', () => {
    expect(sanitizeDisabledTypes([null, 42, {}, 'movie'])).toEqual(['movie']);
  });

  it('de-dupes', () => {
    expect(sanitizeDisabledTypes(['movie', 'movie'])).toEqual(['movie']);
  });

  it('falls back to an empty (everything enabled) list for non-array input', () => {
    expect(sanitizeDisabledTypes(undefined)).toEqual([]);
    expect(sanitizeDisabledTypes(null)).toEqual([]);
    expect(sanitizeDisabledTypes('nonsense')).toEqual([]);
  });
});
