// React Native ships its own URL polyfill (Hermes has no native URL of its
// own) rather than a full WHATWG-compliant parser. It has a few quirks
// this normalization has to compensate for — none of them domain/TLD
// validation, all of them just working around the polyfill's gaps:
//  - its single-argument constructor never actually validates its input
//    (it only validates a second `base` argument, which we don't pass);
//  - it appends a spurious trailing "/" even to URLs that already end in
//    a real path segment;
//  - its hostname/protocol getters match the literal lowercase "http(s)"
//    prefix, so an uppercase scheme like "HTTPS://" fails to parse.
//
// Real scheme names (http, mailto, tel, ftp, ...) never contain a dot, so
// excluding "." from this class is what lets "example.com:8080" read as
// a host:port rather than a (bogus) "example.com" scheme.
const SCHEME_PREFIX_PATTERN = /^[a-z][a-z\d+-]*:/i;
const HTTP_SCHEME_PATTERN = /^https?:\/\//i;

// Turns forgiving link input ("example.com", "www.example.com") into a
// normalized http(s) URL, preserving an explicit scheme if the user
// already typed one. Returns null if the input can't be interpreted as a
// web URL.
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const hasHttpScheme = HTTP_SCHEME_PATTERN.test(trimmed);
  if (SCHEME_PREFIX_PATTERN.test(trimmed) && !hasHttpScheme) {
    return null;
  }

  const rawCandidate = hasHttpScheme ? trimmed : `https://${trimmed}`;
  // Normalize the scheme to lowercase (schemes are case-insensitive per
  // RFC 3986) so the polyfill's case-sensitive getters can read it.
  const candidate = rawCandidate.replace(HTTP_SCHEME_PATTERN, (match) =>
    match.toLowerCase()
  );

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return null;
  }
  if (!parsed.hostname || /\s/.test(parsed.hostname)) {
    return null;
  }

  const normalized = parsed.toString();
  const hadExplicitPath = candidate
    .replace(HTTP_SCHEME_PATTERN, '')
    .includes('/');

  // The polyfill adds a trailing "/" whenever there's no query/hash, even
  // if the input already had its own path — undo that specific case.
  if (hadExplicitPath && normalized === `${candidate}/`) {
    return candidate;
  }

  return normalized;
}
