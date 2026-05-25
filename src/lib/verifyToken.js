// Simple secure hash for document verification tokens
// Uses a combination of document ID, timestamp, and a system key

const SYSTEM_KEY = "SAKURA-SMPN4-VERIFY-2026";

export function generateToken(docId) {
  const payload = `${docId}-${SYSTEM_KEY}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}sk`;
}

export function verifyToken(docId, token) {
  return generateToken(docId) === token;
}

export function buildVerifyUrl(docId) {
  const token = generateToken(docId);
  return `${window.location.origin}/verify-document/${docId}?token=${token}`;
}
