import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

/**
 * 토큰 관련 유틸리티 함수들
 * axios.js와 authService.js의 중복 제거를 위해 분리
 */

/**
 * 토큰 만료 체크 (5분 전)
 */
export const isTokenExpiringSoon = (token) => {
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

/**
 * 토큰 갱신 함수 (순수 함수, 다른 서비스에 의존하지 않음)
 */
export const refreshTokenRequest = async () => {
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
    throw new Error('토큰이 응답 헤더에 없습니다.');
  } catch (error) {
    sessionStorage.removeItem('jwt');
    throw error;
  }
};

/**
 * 현재 저장된 토큰 가져오기
 */
export const getCurrentToken = () => {
  return sessionStorage.getItem('jwt');
};

/**
 * 토큰 저장
 */
export const saveToken = (token) => {
  sessionStorage.setItem('jwt', token);
};

/**
 * 토큰 제거
 */
export const removeToken = () => {
  sessionStorage.removeItem('jwt');
};

/**
 * 토큰 유효성 검사
 */
export const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}; 