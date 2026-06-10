import api from "@/lib/apiClient";

/**
 * @returns {{ total, menunggu, diarsipkan, ditolak, recentUploads }}
 */
export async function getStats() {
  const { data } = await api.get("/dashboard/stats");
  return data;
}

/**
 * @param {{ period: "weekly"|"monthly", from: string, to: string }} params
 * @returns {{ period: string, data: Array }}
 */
export async function getChartData({ period = "weekly", from, to } = {}) {
  const params = { period };
  if (from) params.from = from;
  if (to)   params.to   = to;
  const { data } = await api.get("/dashboard/chart", { params });
  return data;
}

/**
 * @param {number} limit 
 * @returns {{ activity: Array }}
 */
export async function getActivity(limit = 10) {
  const { data } = await api.get("/dashboard/activity", { params: { limit } });
  return data;
}
