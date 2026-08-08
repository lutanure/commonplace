import { normalizeUrl } from './url';

// Note on test environment: Jest (via jest-expo/React Native's jest preset)
// runs on Node's own `URL` global — a spec-compliant WHATWG implementation —
// not the React Native polyfill this function's own comments describe
// (`react-native/Libraries/Blob/URL.js`). For every case below, both
// implementations agree on the final normalized string. The one documented
// case where they *don't* agree is hostname casing preservation under an
// uppercase scheme (Node's real URL lowercases the host per spec; the RN
// polyfill's regex-based getters don't) — so test inputs here deliberately
// keep hostnames lowercase even when exercising the scheme-case-insensitivity
// branch, rather than asserting Node-specific output for something that
// would render differently on-device.

describe('normalizeUrl', () => {
  it('turns a bare domain into an https URL', () => {
    expect(normalizeUrl('imdb.com')).toBe('https://imdb.com/');
  });

  it('turns a www-prefixed domain into an https URL', () => {
    expect(normalizeUrl('www.imdb.com')).toBe('https://www.imdb.com/');
  });

  it('preserves an existing path without adding a duplicate trailing slash', () => {
    expect(normalizeUrl('imdb.com/title/tt13238346')).toBe(
      'https://imdb.com/title/tt13238346'
    );
  });

  it('leaves an explicit https URL with a path unchanged', () => {
    expect(normalizeUrl('https://imdb.com/title/tt13238346')).toBe(
      'https://imdb.com/title/tt13238346'
    );
  });

  it('preserves an explicit http scheme rather than forcing https', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('normalizes an uppercase scheme without altering an already-lowercase host', () => {
    expect(normalizeUrl('HTTP://example.com')).toBe('http://example.com/');
  });

  it('normalizes a query with no explicit path', () => {
    expect(normalizeUrl('example.com?x=1')).toBe('https://example.com/?x=1');
  });

  it('leaves an input that already ends in a slash unchanged', () => {
    expect(normalizeUrl('example.com/')).toBe('https://example.com/');
    expect(normalizeUrl('https://example.com/path/')).toBe(
      'https://example.com/path/'
    );
  });

  it('reads host:port as a port, not a bogus scheme', () => {
    expect(normalizeUrl('example.com:8080/page')).toBe(
      'https://example.com:8080/page'
    );
  });

  it('trims surrounding whitespace from otherwise-valid input', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com/');
  });

  it('rejects input with no recognizable host', () => {
    expect(normalizeUrl('not a website')).toBeNull();
  });

  it('rejects a non-http(s) scheme rather than double-prefixing it', () => {
    expect(normalizeUrl('ftp://example.com')).toBeNull();
    expect(normalizeUrl('mailto:test@example.com')).toBeNull();
  });

  it('rejects empty or whitespace-only input', () => {
    expect(normalizeUrl('')).toBeNull();
    expect(normalizeUrl('   ')).toBeNull();
  });
});
