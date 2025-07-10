import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetWithParams,
  apiGetSilent,
  apiParallel 
} from '../apiHelpers';

/**
 * 사용자 관련 API 서비스
 */

const userService = {
  /**
   * 현재 로그인한 사용자 정보 조회
   */
  getCurrentUser: async (options = {}) => {
    return apiGet('/api/users/me', {
      customErrorMessage: '사용자 정보를 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 특정 사용자 정보 조회
   */
  getUserById: async (userId, options = {}) => {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }
    
    return apiGet(`/api/users/${userId}`, {
      customErrorMessage: '사용자 정보를 찾을 수 없습니다.',
      ...options
    });
  },

  /**
   * 현재 사용자 프로필 업데이트
   */
  updateCurrentUser: async (profileData, options = {}) => {
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('유효한 프로필 데이터가 필요합니다.');
    }

    return apiPut('/api/users/me', profileData, {
      customErrorMessage: '프로필 업데이트에 실패했습니다.',
      ...options
    });
  },

  /**
   * 사용자 권한 변경 (관리자/교수용)
   */
  changeUserRole: async (userId, newRole, courseId = null, options = {}) => {
    if (!userId || !newRole) {
      throw new Error('사용자 ID와 새 권한이 필요합니다.');
    }

    const payload = { newRole };
    if (courseId) {
      payload.courseId = courseId;
    }

    return apiPut(`/api/users/${userId}/role`, payload, {
      customErrorMessage: '권한 변경에 실패했습니다.',
      ...options
    });
  },

  /**
   * 모든 사용자 목록 조회 (관리자용)
   */
  getAllUsers: async (options = {}) => {
    return apiGet('/api/users', {
      customErrorMessage: '사용자 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 사용자 정보 수정 (관리자용)
   */
  updateUser: async (userId, userData, options = {}) => {
    if (!userId || !userData) {
      throw new Error('사용자 ID와 수정할 데이터가 필요합니다.');
    }

    return apiPut(`/api/users/${userId}`, userData, {
      customErrorMessage: '사용자 정보 수정에 실패했습니다.',
      ...options
    });
  },

  /**
   * 사용자 삭제 (관리자용)
   */
  deleteUser: async (userId, options = {}) => {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    return apiDelete(`/api/users/${userId}`, {
      customErrorMessage: '사용자 삭제에 실패했습니다.',
      ...options
    });
  },

  /**
   * 사용자 강의에서 탈퇴시키기
   */
  removeUserFromCourse: async (userId, courseId, options = {}) => {
    if (!userId || !courseId) {
      throw new Error('사용자 ID와 강의 ID가 필요합니다.');
    }

    return apiDelete(`/api/users/${userId}/courses/${courseId}`, {
      customErrorMessage: '사용자 탈퇴 처리에 실패했습니다.',
      ...options
    });
  },

  /**
   * 현재 사용자가 특정 강의에서 탈퇴
   */
  leaveCourse: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiDelete(`/api/users/me/courses/${courseId}`, {
      customErrorMessage: '강의 탈퇴에 실패했습니다.',
      ...options
    });
  },

  /**
   * 사용자 검색 (부분 일치)
   */
  searchUsers: async (query, options = {}) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return apiGetWithParams('/api/users', 
      { search: query.trim() }, 
      {
        customErrorMessage: '사용자 검색에 실패했습니다.',
        showToast: false, // 검색은 조용히
        ...options
      }
    );
  },

  /**
   * 사용자 역할별 필터링
   */
  getUsersByRole: async (role, options = {}) => {
    if (!role) {
      throw new Error('역할이 필요합니다.');
    }

    return apiGetWithParams('/api/users', 
      { role }, 
      {
        customErrorMessage: '사용자 목록을 불러올 수 없습니다.',
        ...options
      }
    );
  },

  /**
   * 여러 사용자 정보를 한번에 조회
   */
  getUsersByIds: async (userIds, options = {}) => {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

    // 병렬로 여러 사용자 정보 조회
    const requests = userIds.map(userId => ({
      method: 'get',
      url: `/api/users/${userId}`,
      options: { showToast: false }
    }));

    try {
      return await apiParallel(requests);
    } catch (error) {
      console.warn('Some user requests failed:', error);
      // 실패한 요청이 있어도 성공한 것들은 반환
      return [];
    }
  }
};

export default userService; 