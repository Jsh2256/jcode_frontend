import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

// 새로운 API 서비스 import
import { userService, authService } from '../services/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 토큰 만료 체크 (5분 전)
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    return timeUntilExpiry < 5 * 60 * 1000;
  } catch (error) {
    return true;
  }
};

// 토큰 갱신 함수
const refreshToken = async (currentToken) => {
  try {
    const response = await axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      withCredentials: true
    }).post('/api/auth/refresh', null);

    const authHeader = response.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const newToken = authHeader.substring(7);
      sessionStorage.setItem('jwt', newToken);
      return newToken;
    }
  } catch (error) {
    toast.error('세션이 만료되어 로그아웃됩니다.', {
      autoClose: 2000,
      onClose: () => auth.logout()
    });
    throw error;
  }
};

// 요청 인터셉터
api.interceptors.request.use(async (config) => {
  if (config.url === '/api/auth/refresh') {
    return config;
  }

  const token = sessionStorage.getItem('jwt');
  
  // 토큰이 있고 곧 만료될 예정이면 미리 갱신
  if (token && isTokenExpiringSoon(token)) {
    try {
      await refreshToken(token);
    } catch (error) {
      // 에러 처리는 refreshToken 함수 내에서 수행
    }
  }

  // 최신 토큰으로 요청
  const currentToken = sessionStorage.getItem('jwt');
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    const authHeader = response.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      sessionStorage.setItem('jwt', token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const currentToken = sessionStorage.getItem('jwt');
        if (!currentToken) {
          toast.error('세션이 만료되어 로그아웃됩니다.', {
            autoClose: 2000,
            onClose: () => auth.logout()
          });
          throw new Error('No token available');
        }
        
        const newToken = await refreshToken(currentToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth 관련 함수들
export const auth = {
  login: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/keycloak`;
  },
  
  getAccessToken: async () => {
    try {
      const response = await api.post('/api/auth/token');
      const authHeader = response.headers['authorization'];
      
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('토큰이 응답 헤더에 없습니다');
      }

      const token = authHeader.substring(7);
      sessionStorage.setItem('jwt', token);

      return token;
    } catch (error) {
      toast.error('토큰 요청에 실패했습니다.');
      throw error;
    }
  },

  refreshToken,

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // 에러 처리는 서비스 내에서 처리됨
      sessionStorage.removeItem('jwt');
      window.location.href = '/login';
    }
  },

  getUserProfile: async () => {
    try {
      const data = await userService.getCurrentUser();
      return { data }; // 기존 인터페이스 유지
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const data = await userService.updateCurrentUser(profileData);
      return { data }; // 기존 인터페이스 유지  
    } catch (error) {
      throw error;
    }
  },
};

export default api; 