import api from "@/lib/apiClient";

/**
 * Kirim heartbeat — menandai diri sendiri online & memperbarui last_seen_at.
 * Dipanggil berkala selagi tab aktif (lihat usePresenceHeartbeat di AppContext).
 */
export async function sendHeartbeat() {
  const { data } = await api.post("/presence/heartbeat");
  return data;
}

/**
 * Tandai diri sendiri offline. Dipanggil saat logout eksplisit.
 */
export async function markOffline() {
  const { data } = await api.post("/presence/offline");
  return data;
}

/**
 * Tandai diri sendiri offline lewat navigator.sendBeacon — dipakai khusus
 * saat tab/browser ditutup (event 'pagehide'/'beforeunload'), karena pada
 * momen itu request fetch/XHR biasa bisa dibatalkan oleh browser sebelum
 * selesai terkirim. sendBeacon dijamin browser tetap mengirimkannya di
 * background meski halaman sudah ditutup.
 *
 * Catatan: sendBeacon tidak bisa membawa header Authorization custom,
 * jadi token JWT dikirim lewat query string agar backend tetap bisa
 * mengautentikasi permintaan ini.
 */
export function markOfflineBeacon(token) {
  if (!token || typeof navigator === "undefined" || !navigator.sendBeacon) return false;
  const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
  const url = `${base}/presence/offline-beacon?token=${encodeURIComponent(token)}`;
  try {
    return navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
  } catch {
    return false;
  }
}

/**
 * Ambil status online/offline untuk daftar userId tertentu.
 * Jika userIds kosong/undefined, server mengembalikan status SEMUA user.
 *
 * @param {Array<number>} [userIds]
 * @returns {Promise<Record<number, { online: boolean, lastSeenAt: string|null }>>}
 */
export async function getStatuses(userIds) {
  const params = {};
  if (userIds && userIds.length) params.ids = userIds.join(",");
  const { data } = await api.get("/presence/status", { params });
  return data.statuses || {};
}
