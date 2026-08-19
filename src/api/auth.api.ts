import api from "./axios";

export interface RegisterData {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  profilePicture?: File | null;
}

export interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      role: string;
      profilePicture: string | null;
      isEmailVerified: boolean;
    };
    accessToken: string;
  };
}

export interface ResendOtpData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface ResetOtpData {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  valid: boolean;
  message: string;
  resetToken: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LoginResponse {
  date: string;
  message: string;
  accessToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}

export const authApi = {
  register: (data: RegisterData) => {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("country", data.country);
    formData.append("city", data.city);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("nationalId", data.nationalId);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }
    return api.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  login: (data: LoginData) => {
    const { username, password, rememberMe } = data;
    return api.post<LoginResponse>("/auth/login", {
      username,
      password,
      rememberMe,
    });
  },
  verifyEmail: (data: VerifyEmailData) => api.post("/auth/verify-email", data),
  resendVerificationOtp: (data: ResendOtpData) =>
    api.post("/auth/resend-verification-otp", data),
  logout: () => api.post("/auth/logout"),
  logoutAll: () =>
    api.post<{ message: string; revokedSessions: number }>("/auth/logout-all"),
  refreshToken: () => api.post<RefreshTokenResponse>("/auth/refresh-token"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (data: ForgotPasswordData) =>
    api.post<ForgotPasswordResponse>("/auth/forgot-password", data),
  verifyResetOtp: (data: ResetOtpData) =>
    api.post<VerifyResetOtpResponse>("/auth/verify-reset-otp", data),
  resetPassword: (data: ResetPasswordData, resetToken: string) =>
    api.post<ResetPasswordResponse>(
      "/auth/reset-password",
      data,
      { headers: { "reset-token": resetToken } },
    ),
};
