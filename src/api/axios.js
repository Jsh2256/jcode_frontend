import axios from 'axios';

// 토큰 유틸리티 import
import { 
  isTokenExpiringSoon, 
  refreshTokenRequest, 
  getCurrentToken,
  saveToken,
  removeToken 
} from '../utils/tokenUtils';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 토큰 갱신 함수 (에러 처리 minimal - 토스트는 errorHandler에서 처리)
const refreshToken = async () => {
  try {
    return await refreshTokenRequest();
  } catch (error) {
    // 토큰 갱신 실패 시 즉시 로그아웃 (토스트는 errorHandler에서)
    removeToken();
    window.location.href = '/login';
    throw error;
  }
};

// 요청 인터셉터
api.interceptors.request.use(async (config) => {
  if (config.url === '/api/auth/refresh') {
    return config;
  }

  const token = getCurrentToken();
  
  // 토큰이 있고 곧 만료될 예정이면 미리 갱신
  if (token && isTokenExpiringSoon(token)) {
    try {
      await refreshToken();
    } catch (error) {
      // 에러 처리는 refreshToken 함수 내에서 수행
    }
  }

  // 최신 토큰으로 요청
  const currentToken = getCurrentToken();
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
      saveToken(token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const currentToken = getCurrentToken();
        if (!currentToken) {
          // 토큰이 없으면 즉시 로그아웃 (토스트는 errorHandler에서)
          removeToken();
          window.location.href = '/login';
          throw new Error('No token available');
        }
        
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 