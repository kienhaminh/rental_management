const AUTH_STORAGE_KEY = 'rental_auth_session';

export interface AuthSession {
  username: string;
  timestamp: number;
}

export const auth = {
  login: (username: string, password: string): boolean => {
    // Simple hardcoded authentication
    if (username === 'admin' && password === 'admin') {
      const session: AuthSession = {
        username,
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getSession: (): AuthSession | null => {
    try {
      const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!sessionStr) return null;
      return JSON.parse(sessionStr) as AuthSession;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return auth.getSession() !== null;
  },
};
