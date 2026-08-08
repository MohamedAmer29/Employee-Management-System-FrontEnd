const STORAGE_KEY = "ems_access_token";

let accessToken: string | null = null;

const readStoredToken = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// Initialize from storage at module load so a page refresh can reuse a still-valid token.
accessToken = readStoredToken();

export const setAuthToken = (token: string | null) => {
  accessToken = token;
  try {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode etc.); the in-memory token still works.
  }
};

export const getAuthToken = (): string | null => accessToken;

export const clearAuthToken = () => {
  setAuthToken(null);
};
