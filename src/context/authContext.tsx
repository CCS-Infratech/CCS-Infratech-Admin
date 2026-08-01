// src/contexts/AuthContext.tsx
'use client';

import { authService } from '@/http/auth';
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useState,
  useRef,
  ReactNode
} from 'react';

type User = {
  id: string;
  username: string;
  role: string;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// State definition
type AuthState = {
  user: User | null;
  status: AuthStatus;
  error: string | null;
};

// Action types
type AuthAction =
  | { type: 'AUTH_INIT' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' };

// Initial state
const initialState: AuthState = {
  user: null,
  status: 'loading',
  error: null
};

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_INIT':
      return { ...state, status: 'loading', error: null };
    case 'AUTH_SUCCESS':
      return { user: action.payload, status: 'authenticated', error: null };
    case 'AUTH_FAILURE':
      return { user: null, status: 'error', error: action.payload };
    case 'AUTH_LOGOUT':
      return { user: null, status: 'unauthenticated', error: null };
    default:
      return state;
  }
}

// Context type definition
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

// Create context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function parseCookieValue(name: string): any {
  const cookie = getCookie(name);
  if (!cookie) return null;

  try {
    const decodedCookie = decodeURIComponent(cookie);

    if (name === 'userInfo' && decodedCookie.startsWith(name)) {
      const jsonStr = decodedCookie.substring(name.length);
      return JSON.parse(jsonStr);
    }

    return JSON.parse(decodedCookie);
  } catch (error) {
    console.error(`Failed to parse ${name} cookie:`, error);
    return null;
  }
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  // Clear refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Check and setup token refresh
  useEffect(() => {
    if (tokenExpiryTime && state.status === 'authenticated') {
      const now = Date.now();
      const timeUntilExpiry = tokenExpiryTime - now;

      // If already expired
      if (timeUntilExpiry <= 0) {
        logout();
        return;
      }

      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

      refreshTimerRef.current = setTimeout(() => {
        refreshUser();
      }, refreshTime);

      return () => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
      };
    }
  }, [tokenExpiryTime, state.status]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_status') {
        const newStatus = e.newValue;
        if (newStatus === 'logged_out') {
          dispatch({ type: 'AUTH_LOGOUT' });
        } else if (
          newStatus === 'logged_in' &&
          state.status !== 'authenticated'
        ) {
          checkAuthStatus();
        }
      } else if (e.key === 'user') {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            dispatch({ type: 'AUTH_SUCCESS', payload: userData });
          } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.status]);

  // Initial auth check
  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: 'AUTH_INIT' });

    try {
      // First check localStorage for user data
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          dispatch({ type: 'AUTH_SUCCESS', payload: userData });

          // Still refresh for latest data
          refreshUser();
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // Try cookies as fallback
          checkCookies();
        }
      } else {
        // No localStorage data, check cookies
        checkCookies();
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to authenticate' });
    }
  }, []);

  // Helper to check cookies for auth data
  const checkCookies = () => {
    // Try to get user from cookie
    const user = parseCookieValue('userInfo');

    if (user) {
      dispatch({ type: 'AUTH_SUCCESS', payload: user });

      // Store in localStorage for cross-tab access
      localStorage.setItem('user', JSON.stringify(user));

      // Still refresh for latest data
      refreshUser();
    } else {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Run the initial check
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Register function
  const register = async (userData: any) => {
    dispatch({ type: 'AUTH_INIT' });

    try {
      const response = await authService.register(userData);

      // If registration auto-logs in
      if (response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('auth_status', 'logged_in');

        if (response.token) {
          localStorage.setItem('accessToken', response.token);
        }

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  // Login function
  const login = async (username: string, password: string) => {
    dispatch({ type: 'AUTH_INIT' });

    try {
      const response = await authService.login({ username, password });

      if (response.user) {
        // Save to state
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('auth_status', 'logged_in');

        // Save tokens if provided
        if (response.token) {
          localStorage.setItem('accessToken', response.token);
        }

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Check for token expiry if JWT
        if (response.token && response.token.split('.').length === 3) {
          try {
            const payload = JSON.parse(atob(response.token.split('.')[1]));
            if (payload.exp) {
              setTokenExpiryTime(payload.exp * 1000);
            }
          } catch (e) {
            console.error('Failed to parse token expiry:', e);
          }
        }
      } else {
        throw new Error('No user data returned');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      setTokenExpiryTime(null);

      // Notify other tabs
      localStorage.setItem('auth_status', 'logged_out');

      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on client side even if API fails
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // Refresh user data with retry logic
  const refreshUser = useCallback(async () => {
    if (state.status !== 'authenticated') return;

    const retryRequest = async (retries = 0) => {
      try {
        // Use authService instead of fetch
        const response = await authService.getCurrentUser();

        // Assuming response has { success: true, user: {...} } structure
        if (response.success && response.user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          throw new Error(response.message || 'Failed to refresh user data');
        }
      } catch (error: any) {
        // Check for auth errors in axios response
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          return;
        }

        // Implement retry with exponential backoff
        if (retries < MAX_RETRIES) {
          const delay = Math.pow(2, retries) * 1000;

          // Set up retry
          refreshTimerRef.current = setTimeout(() => {
            retryRequest(retries + 1);
          }, delay);
        } else {
          // After maximum retries, update state with error
          const message =
            error.response?.data?.message ||
            error.message ||
            'Failed to refresh user data';
          dispatch({ type: 'AUTH_FAILURE', payload: message });
        }
      }
    };

    retryRequest();
  }, [state.status, logout]);

  const contextValue = {
    ...state,
    login,
    logout,
    refreshUser,
    register
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
