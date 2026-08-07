// A short, locally-unique id. Not cryptographically strong — fine for
// client-only mock/demo data before a real backend assigns ids.
export function generateLocalId(prefix: string): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${time}-${random}`;
}
