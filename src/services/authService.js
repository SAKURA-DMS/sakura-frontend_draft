import api, { setToken, clearToken } from "@/lib/apiClient";

/**
 * Login user.
 *
 * @returns {Promise<{ token?: string, user?: object, require2FA?: boolean, email?: string }>}
 */
export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

/**
 * Kirim / resend OTP.
 *
 * @param {string} [email] - opsional, hanya untuk mode belum login
 * @returns {Promise<{ message: string }>}
 */
export async function sendOtp(email) {
  const body = email ? { email } : {};
  const { data } = await api.post("/auth/send-otp", body);
  return data;
}

/**
 * @param {string} email  
 * @param {string} otp    
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function verifyOtpLogin(email, otp) {
  const { data } = await api.post("/auth/verify-otp", { email, otp });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

/**
 *
 * @param {string} otp - 6-digit OTP yang dikirim ke email
 * @returns {Promise<{ message: string, is2faEnabled: boolean }>}
 */
export async function enable2FA(otp) {
  const { data } = await api.post("/auth/enable-2fa", { otp });
  return data;
}

/**
 *
 * @param {string} password 
 * @returns {Promise<{ message: string, is2faEnabled: boolean }>}
 */
export async function disable2FA(password) {
  const { data } = await api.post("/auth/disable-2fa", { password });
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function changePassword(oldPassword, newPassword) {
  const { data } = await api.post("/auth/change-password", { oldPassword, newPassword });
  return data;
}

export function logout() {
  clearToken();
}