import api from './axios';

// ── Types ─────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified: boolean;
  mfaEnabled: boolean;
  googleId?: string;
  githubId?: string;
  passkeys?: { id: string; deviceType: string }[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────
export const authApi = {
  // Register
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ userId: string }>>('/auth/register', payload),

  // Login
  login: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<{
      accessToken?: string;
      user?: User;
      mfaRequired?: boolean;
      tempToken?: string;
    }>>('/auth/login', payload),

  // Logout
  logout: () => api.post<ApiResponse>('/auth/logout'),

  // Get current user
  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),

  // Refresh token
  refresh: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  // Verify email
  verifyEmail: (token: string) =>
    api.post<ApiResponse>('/auth/verify-email', { token }),

  // Forgot password
  forgotPassword: (email: string) =>
    api.post<ApiResponse>('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse>('/auth/reset-password', { token, password }),

  // Magic link - send
  sendMagicLink: (email: string) =>
    api.post<ApiResponse>('/auth/magic/send', { email }),

  // OAuth URLs (redirect, not fetch)
  googleUrl: () => `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`,
  githubUrl: () => `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`,
};

// ─────────────────────────────────────────────────────────────────
// MFA
// ─────────────────────────────────────────────────────────────────
export const mfaApi = {
  // Setup - generate QR code
  setup: () =>
    api.post<ApiResponse<{ qrCode: string; secret: string }>>('/mfa/setup'),

  // Confirm - first OTP after scanning QR
  confirm: (otp: string) =>
    api.post<ApiResponse>('/mfa/confirm', { otp }),

  // Verify - during login when MFA required
  verify: (otp: string, tempToken: string) =>
    api.post<ApiResponse<{ accessToken: string; user: User }>>('/mfa/verify', { otp, tempToken }),

  // Disable MFA
  disable: (otp: string) =>
    api.post<ApiResponse>('/mfa/disable', { otp }),
};

// ─────────────────────────────────────────────────────────────────
// PASSKEY / WEBAUTHN
// ─────────────────────────────────────────────────────────────────
export const passkeyApi = {
  // Register options
  registerOptions: () =>
    api.post<ApiResponse<{ options: PublicKeyCredentialCreationOptionsJSON }>>('/passkey/register/options'),

  // Register verify
  registerVerify: (response: RegistrationResponseJSON) =>
    api.post<ApiResponse>('/passkey/register/verify', response),

  // Auth options
  authOptions: (email: string) =>
    api.post<ApiResponse<{ options: PublicKeyCredentialRequestOptionsJSON; userId: string }>>('/passkey/auth/options', { email }),

  // Auth verify
  authVerify: (userId: string, response: AuthenticationResponseJSON) =>
    api.post<ApiResponse<{ accessToken: string; user: User }>>('/passkey/auth/verify', { userId, response }),

  // List passkeys
  list: () =>
    api.get<ApiResponse<{ passkeys: { id: string; deviceType: string }[] }>>('/passkey/list'),

  // Delete passkey
  delete: (credentialId: string) =>
    api.delete<ApiResponse>(`/passkey/${credentialId}`),
};

// ─────────────────────────────────────────────────────────────────
// USER / PROFILE
// ─────────────────────────────────────────────────────────────────
export const userApi = {
  // Get profile
  getProfile: () =>
    api.get<ApiResponse<{ user: User }>>('/user/profile'),

  // Update profile
  updateProfile: (payload: { name?: string; avatar?: string }) =>
    api.put<ApiResponse<{ user: User }>>('/user/profile', payload),

  // Change password
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse>('/user/change-password', { currentPassword, newPassword }),

  // Get sessions
  getSessions: () =>
    api.get<ApiResponse<{ sessions: Session[] }>>('/user/sessions'),

  // Revoke one session
  revokeSession: (sessionId: string) =>
    api.delete<ApiResponse>(`/user/sessions/${sessionId}`),

  // Revoke all other sessions
  revokeAllSessions: () =>
    api.delete<ApiResponse>('/user/sessions'),

  // Admin: get all users
  getAllUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<ApiResponse<{ users: User[]; pagination: Pagination }>>('/user/admin/users', { params }),

  // Admin: update role
  updateRole: (userId: string, role: string) =>
    api.put<ApiResponse<{ user: User }>>(`/user/admin/users/${userId}/role`, { role }),

  // Admin: deactivate user
  deactivateUser: (userId: string) =>
    api.put<ApiResponse>(`/user/admin/users/${userId}/deactivate`),
};

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
export interface Session {
  _id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Helpers for WebAuthn (browser API types)
type PublicKeyCredentialCreationOptionsJSON = object;
type PublicKeyCredentialRequestOptionsJSON = object;
type RegistrationResponseJSON = object;
type AuthenticationResponseJSON = object;
