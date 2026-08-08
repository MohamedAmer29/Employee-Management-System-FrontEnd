import Cookies from 'js-cookie';

export const COOKIE_KEYS = {
  VERIFICATION_EMAIL: 'verification_email',
  RESEND_ATTEMPTS: 'resend_attempts',
  RESEND_COUNTDOWN: 'resend_countdown',
} as const;

// Companion marker the backend sets alongside the httpOnly refresh_token
// cookie, so the frontend can tell a session exists without reading the token.
export const hasRefreshCookie = (): boolean => {
  return Boolean(Cookies.get('refresh_token_present'));
};

export const setVerificationEmail = (email: string) => {
  Cookies.set(COOKIE_KEYS.VERIFICATION_EMAIL, email, { expires: 1, secure: true, sameSite: 'lax' });
};

export const getVerificationEmail = (): string | null => {
  return Cookies.get(COOKIE_KEYS.VERIFICATION_EMAIL) || null;
};

export const removeVerificationEmail = () => {
  Cookies.remove(COOKIE_KEYS.VERIFICATION_EMAIL);
};

export const getResendAttempts = (): number => {
  const attempts = Cookies.get(COOKIE_KEYS.RESEND_ATTEMPTS);
  return attempts ? parseInt(attempts, 10) : 0;
};

export const setResendAttempts = (attempts: number) => {
  Cookies.set(COOKIE_KEYS.RESEND_ATTEMPTS, attempts.toString(), { expires: 1, secure: true, sameSite: 'lax' });
};

export const incrementResendAttempts = () => {
  const current = getResendAttempts();
  setResendAttempts(current + 1);
};

export const removeResendAttempts = () => {
  Cookies.remove(COOKIE_KEYS.RESEND_ATTEMPTS);
};

export const getResendCountdown = (): number => {
  const countdown = Cookies.get(COOKIE_KEYS.RESEND_COUNTDOWN);
  return countdown ? parseInt(countdown, 10) : 900;
};

export const setResendCountdown = (seconds: number) => {
  Cookies.set(COOKIE_KEYS.RESEND_COUNTDOWN, seconds.toString(), { expires: 1, secure: true, sameSite: 'lax' });
};

export const removeResendCountdown = () => {
  Cookies.remove(COOKIE_KEYS.RESEND_COUNTDOWN);
};

export const clearVerificationData = () => {
  removeVerificationEmail();
  removeResendAttempts();
  removeResendCountdown();
};
