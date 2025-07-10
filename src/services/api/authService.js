import apiClient from '../apiClient';

/**
 * 인증 관련 API 서비스
 */

const authService = {
  /**
   * 토큰 갱신
   */
  refreshToken: async (options = {}) => {
    return apiClient.post('/api/auth/token', null, {
      customErrorMessage: '토큰 갱신에 실패했습니다.',
      showToast: false, // 토큰 갱신은 조용히 처리
      ...options
    });
  },

  /**
   * 로그아웃
   */
  logout: async (options = {}) => {
    return apiClient.post('/logout', null, {
      customErrorMessage: '로그아웃에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * JCode 리다이렉트 URL 생성
   */
  getJCodeRedirect: async (params = {}, options = {}) => {
    return apiClient.getWithParams('/api/redirect', params, {
      customErrorMessage: 'JCode 리다이렉트를 생성할 수 없습니다.',
      ...options
    });
  },

  /**
   * JCode 리다이렉트 실행
   */
  executeJCodeRedirect: async (redirectData, options = {}) => {
    if (!redirectData) {
      throw new Error('리다이렉트 데이터가 필요합니다.');
    }

    return apiClient.post('/api/redirect', redirectData, {
      customErrorMessage: 'JCode 리다이렉트 실행에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 현재 인증 상태 확인
   */
  checkAuthStatus: async (options = {}) => {
    return apiClient.get('/api/auth/status', {
      customErrorMessage: '인증 상태를 확인할 수 없습니다.',
      showToast: false,
      ...options
    });
  },

  /**
   * 세션 연장
   */
  extendSession: async (options = {}) => {
    return apiClient.post('/api/auth/extend', null, {
      customErrorMessage: '세션 연장에 실패했습니다.',
      showToast: false,
      ...options
    });
  },

  /**
   * 사용자 권한 확인
   */
  checkPermission: async (resource, action, options = {}) => {
    if (!resource || !action) {
      throw new Error('리소스와 액션이 필요합니다.');
    }

    return apiClient.getWithParams('/api/auth/permission', 
      { resource, action }, 
      {
        customErrorMessage: '권한을 확인할 수 없습니다.',
        showToast: false,
        ...options
      }
    );
  },

  /**
   * 토큰 유효성 검증
   */
  validateToken: async (token, options = {}) => {
    if (!token) {
      throw new Error('토큰이 필요합니다.');
    }

    return apiClient.post('/api/auth/validate', { token }, {
      customErrorMessage: '토큰 검증에 실패했습니다.',
      showToast: false,
      ...options
    });
  },

  /**
   * 강제 로그아웃 (모든 세션)
   */
  logoutAll: async (options = {}) => {
    return apiClient.post('/api/auth/logout-all', null, {
      customErrorMessage: '전체 로그아웃에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 비밀번호 변경 (OAuth 아닌 경우)
   */
  changePassword: async (passwordData, options = {}) => {
    if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
      throw new Error('현재 비밀번호와 새 비밀번호가 필요합니다.');
    }

    return apiClient.post('/api/auth/change-password', passwordData, {
      customErrorMessage: '비밀번호 변경에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 이중 인증 활성화
   */
  enable2FA: async (options = {}) => {
    return apiClient.post('/api/auth/2fa/enable', null, {
      customErrorMessage: '이중 인증 활성화에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 이중 인증 비활성화
   */
  disable2FA: async (code, options = {}) => {
    if (!code) {
      throw new Error('인증 코드가 필요합니다.');
    }

    return apiClient.post('/api/auth/2fa/disable', { code }, {
      customErrorMessage: '이중 인증 비활성화에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 이중 인증 코드 검증
   */
  verify2FA: async (code, options = {}) => {
    if (!code) {
      throw new Error('인증 코드가 필요합니다.');
    }

    return apiClient.post('/api/auth/2fa/verify', { code }, {
      customErrorMessage: '인증 코드 검증에 실패했습니다.',
      showToast: false,
      ...options
    });
  },

  /**
   * API 키 생성
   */
  generateApiKey: async (keyData, options = {}) => {
    if (!keyData || !keyData.name) {
      throw new Error('API 키 이름이 필요합니다.');
    }

    return apiClient.post('/api/auth/api-key', keyData, {
      customErrorMessage: 'API 키 생성에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * API 키 삭제
   */
  deleteApiKey: async (keyId, options = {}) => {
    if (!keyId) {
      throw new Error('API 키 ID가 필요합니다.');
    }

    return apiClient.delete(`/api/auth/api-key/${keyId}`, {
      customErrorMessage: 'API 키 삭제에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 내 API 키 목록 조회
   */
  getMyApiKeys: async (options = {}) => {
    return apiClient.get('/api/auth/api-keys', {
      customErrorMessage: 'API 키 목록을 불러올 수 없습니다.',
      ...options
    });
  }
};

export default authService; 