import api from "./axios";

export interface RegisterData {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationalId: string;
  username: string;
  password: string;
  confirmPassword?: string;
  role: string;
  terms?: boolean;
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

export interface ResendOtpData {
  email: string;
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
    // Extract only the fields expected by the backend
    const {
      firstName,
      lastName,
      country,
      city,
      phoneNumber,
      nationalId,
      username,
      password,
      role,
    } = data;
    return api.post("/auth/register", {
      firstName,
      lastName,
      country,
      city,
      phoneNumber,
      nationalId,
      username,
      password,
      role,
    });
  },
  login: (data: LoginData) => {
    const { username, password } = data;
    return api.post<LoginResponse>("/auth/login", { username, password });
  },
  verifyEmail: (data: VerifyEmailData) => api.post("/auth/verify-email", data),
  resendVerificationOtp: (data: ResendOtpData) =>
    api.post("/auth/resend-verification-otp", data),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post<RefreshTokenResponse>("/auth/refresh-token"),
  getMe: () => api.get("/auth/me"),
};
