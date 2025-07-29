import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete
} from '../apiHelpers';

/**
 * 관리자 관련 API 서비스
 * 백엔드 API 명세서에 따른 Admin API 구현
 * ADMIN, PROFESSOR, ASSISTANT 권한 필요
 */

const adminService = {
  // ===========================================
  // 3.1 사용자 관리
  // ===========================================

  /**
   * 모든 사용자 조회 (ADMIN 전용)
   * GET /api/users
   */
  getAllUsers: async (options = {}) => {
    return apiGet('/api/users', {
      customErrorMessage: '사용자 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 특정 사용자 조회
   * GET /api/users/{userId}
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
   * 특정 사용자 삭제 (ADMIN 전용)
   * DELETE /api/users/{userId}
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

  // ===========================================
  // 3.2 사용자 권한 및 강의 관리
  // ===========================================

  /**
   * 사용자 권한 변경
   * PUT /api/users/{userId}/role
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
   * 사용자 강의 탈퇴 처리
   * DELETE /api/users/{userId}/courses/{courseId}
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

  // ===========================================
  // 강의 관리 (ADMIN, PROFESSOR 전용)
  // ===========================================

  /**
   * 전체 강의 목록 조회 (ADMIN 전용)
   * GET /api/courses
   */
  getAllCourses: async (options = {}) => {
    return apiGet('/api/courses', {
      customErrorMessage: '강의 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 강의 생성 (ADMIN, PROFESSOR 전용)
   * POST /api/courses
   */
  createCourse: async (courseData, options = {}) => {
    if (!courseData || typeof courseData !== 'object') {
      throw new Error('유효한 강의 데이터가 필요합니다.');
    }

    // 필수 필드 검증
    const requiredFields = ['name', 'code', 'professor', 'year', 'term'];
    const missingFields = requiredFields.filter(field => !courseData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    }

    return apiPost('/api/courses', courseData, {
      customErrorMessage: '강의 생성에 실패했습니다.',
      ...options
    });
  },

  /**
   * 강의 수정 (ADMIN, PROFESSOR 전용)
   * PUT /api/courses/{courseId}
   */
  updateCourse: async (courseId, courseData, options = {}) => {
    if (!courseId || !courseData) {
      throw new Error('강의 ID와 수정할 데이터가 필요합니다.');
    }

    return apiPut(`/api/courses/${courseId}`, courseData, {
      customErrorMessage: '강의 정보 수정에 실패했습니다.',
      ...options
    });
  },

  /**
   * 강의 삭제 (ADMIN 전용)
   * DELETE /api/courses/{courseId}
   */
  deleteCourse: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiDelete(`/api/courses/${courseId}`, {
      customErrorMessage: '강의 삭제에 실패했습니다.',
      ...options
    });
  },

  /**
   * 강의 키 재발급 (ADMIN, PROFESSOR 전용)
   * GET /api/courses/{courseId}/key
   */
  regenerateCourseKey: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiGet(`/api/courses/${courseId}/key`, {
      customErrorMessage: '강의 키 재발급에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 과제 관리 (ADMIN, PROFESSOR 전용)
  // ===========================================

  /**
   * 과제 생성
   * POST /api/courses/{courseId}/assignments
   */
  createAssignment: async (courseId, assignmentData, options = {}) => {
    if (!courseId || !assignmentData) {
      throw new Error('강의 ID와 과제 데이터가 필요합니다.');
    }

    // 필수 필드 검증
    const requiredFields = ['assignmentName', 'assignmentDescription', 'kickoffDate', 'deadlineDate'];
    const missingFields = requiredFields.filter(field => !assignmentData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    }

    // 날짜 검증
    const kickoffDate = new Date(assignmentData.kickoffDate);
    const deadlineDate = new Date(assignmentData.deadlineDate);
    
    if (kickoffDate >= deadlineDate) {
      throw new Error('마감일은 시작일보다 나중이어야 합니다.');
    }

    return apiPost(`/api/courses/${courseId}/assignments`, assignmentData, {
      customErrorMessage: '과제 생성에 실패했습니다.',
      ...options
    });
  },

  /**
   * 과제 수정
   * PUT /api/courses/{courseId}/assignments/{assignmentId}
   */
  updateAssignment: async (courseId, assignmentId, assignmentData, options = {}) => {
    if (!courseId || !assignmentId || !assignmentData) {
      throw new Error('강의 ID, 과제 ID, 수정 데이터가 필요합니다.');
    }

    // 날짜 검증 (수정할 때만)
    if (assignmentData.kickoffDate && assignmentData.deadlineDate) {
      const kickoffDate = new Date(assignmentData.kickoffDate);
      const deadlineDate = new Date(assignmentData.deadlineDate);
      
      if (kickoffDate >= deadlineDate) {
        throw new Error('마감일은 시작일보다 나중이어야 합니다.');
      }
    }

    return apiPut(`/api/courses/${courseId}/assignments/${assignmentId}`, assignmentData, {
      customErrorMessage: '과제 수정에 실패했습니다.',
      ...options
    });
  },

  /**
   * 과제 삭제
   * DELETE /api/courses/{courseId}/assignments/{assignmentId}
   */
  deleteAssignment: async (courseId, assignmentId, options = {}) => {
    if (!courseId || !assignmentId) {
      throw new Error('강의 ID와 과제 ID가 필요합니다.');
    }

    return apiDelete(`/api/courses/${courseId}/assignments/${assignmentId}`, {
      customErrorMessage: '과제 삭제에 실패했습니다.',
      ...options
    });
  }
};

export default adminService; 