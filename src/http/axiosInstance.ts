import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (originalRequest.url?.includes('/auth/logout')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sign-in';
        }
        return Promise.reject(error);
      }

      if (originalRequest._isRetry) {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sign-in';
        }
        return Promise.reject(error);
      }

      try {
        await api.post('/auth/logout');
      } catch (logoutError) {
        console.error('Logout API call failed:', logoutError);
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
    }

    // Extract error message from backend
    const errorMessage =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Create a better error object
    const customError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    };

    // Log for debugging (optional)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', customError);
    }

    return Promise.reject(customError);
  }
);

export default api;
