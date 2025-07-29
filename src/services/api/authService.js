import { 
  apiGet, 
  apiPost, 
  apiDelete
} from '../apiHelpers';
import { refreshTokenRequest, saveToken, removeToken, getCurrentToken } from '../../utils/tokenUtils';
import api from '../../api/axios';

/**
 * 인증 관련 API 서비스
 * 백엔드 API 명세서에 따른 Auth API 구현
 */

const authService = {
  /**
   * 토큰 발급
   * POST /api/auth/token
   */
  getAccessToken: async (options = {}) => {
    try {
      // apiPost 대신 직접 api 호출로 헤더에 접근
      const response = await api.post('/api/auth/token');
      
      // Authorization 헤더에서 토큰 추출
      const authHeader = response.headers?.['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        saveToken(token);
        return token;
      }
      
      throw new Error('토큰이 응답 헤더에 없습니다');
    } catch (error) {
      if (options.customErrorMessage) {
        throw new Error(options.customErrorMessage);
      }
      throw error;
    }
  },

  /**
   * 일반 회원가입
   * POST /api/auth/signup
   */
  signup: async (registerData, options = {}) => {
    if (!registerData || !registerData.email || !registerData.password) {
      throw new Error('이메일과 비밀번호가 필요합니다.');
    }

    // 필수 필드 검증
    const requiredFields = ['email', 'studentNum', 'role', 'password'];
    const missingFields = requiredFields.filter(field => !registerData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    }

    return apiPost('/api/auth/signup', registerData, {
      customErrorMessage: '회원가입에 실패했습니다.',
      ...options
    });
  },

  /**
   * 일반 로그인
   * POST /api/auth/login/basic
   */
  loginBasic: async (loginData, options = {}) => {
    if (!loginData || !loginData.email || !loginData.password) {
      throw new Error('이메일과 비밀번호가 필요합니다.');
    }

    return apiPost('/api/auth/login/basic', loginData, {
      customErrorMessage: '로그인에 실패했습니다.',
      ...options
    });
  },

  /**
   * 토큰 리프레시
   * POST /api/auth/refresh
   */
  refreshToken: async (options = {}) => {
    try {
      return await refreshTokenRequest();
    } catch (error) {
      // 커스텀 에러 메시지가 필요한 경우를 위해 래핑
      if (options.customErrorMessage && options.showToast !== false) {
        throw new Error(options.customErrorMessage);
      }
      throw error;
    }
  },

  /**
   * OAuth 로그인 (Keycloak)
   * 기존 방식 유지 - 백엔드에서 리다이렉트 처리
   */
  loginOAuth: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/keycloak`;
  },

  /**
   * 로그아웃
   * POST /logout
   */
  logout: async (options = {}) => {
    try {
      await apiPost('/logout', null, {
        customErrorMessage: '로그아웃에 실패했습니다.',
        showToast: false,
        ...options
      });
    } catch (error) {
      // 로그아웃 실패해도 토큰 제거하고 로그인 페이지로
      console.warn('로그아웃 요청 실패:', error);
    } finally {
      removeToken();
      window.location.href = '/login';
    }
  },

  /**
   * 현재 토큰 가져오기
   */
  getCurrentToken,

  /**
   * 토큰 저장
   */
  saveToken,

  /**
   * 토큰 제거
   */
  removeToken
};

export default authService; 