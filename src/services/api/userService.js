import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetWithParams
} from '../apiHelpers';

/**
 * 사용자 관련 API 서비스
 * 백엔드 API 명세서에 따른 User API 구현
 */

const userService = {
  // ===========================================
  // 2.1 내 정보 관리
  // ===========================================

  /**
   * 내 정보 조회
   * GET /api/users/me
   */
  getCurrentUser: async (options = {}) => {
    return apiGet('/api/users/me', {
      customErrorMessage: '사용자 정보를 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 내 정보 수정
   * PUT /api/users/me
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

  // ===========================================
  // 2.2 내 강의 관리
  // ===========================================

  /**
   * 내 강의 목록 조회
   * GET /api/users/me/courses
   */
  getMyCourses: async (options = {}) => {
    return apiGet('/api/users/me/courses', {
      customErrorMessage: '내 강의 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 강의 가입
   * POST /api/users/me/courses
   */
  joinCourse: async (joinData, options = {}) => {
    if (!joinData || !joinData.courseKey) {
      throw new Error('강의 키가 필요합니다.');
    }

    return apiPost('/api/users/me/courses', joinData, {
      customErrorMessage: '강의 가입에 실패했습니다.',
      ...options
    });
  },

  /**
   * 강의 탈퇴
   * DELETE /api/users/me/courses/{courseId}
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

  // ===========================================
  // 2.3 내 강의 상세 정보
  // ===========================================

  /**
   * 내 강의 상세 정보 조회 (과제 포함)
   * GET /api/users/me/courses/details
   */
  getMyCoursesDetails: async (options = {}) => {
    return apiGet('/api/users/me/courses/details', {
      customErrorMessage: '강의 상세 정보를 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 조교 권한 강의 조회 (ASSISTANT 전용)
   * GET /api/users/me/assistant/courses
   */
  getAssistantCourses: async (options = {}) => {
    return apiGet('/api/users/me/assistant/courses', {
      customErrorMessage: '조교 강의 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  // ===========================================
  // 2.4 내 JCode 관리
  // ===========================================

  /**
   * 내 JCode 목록 조회
   * GET /api/users/me/jcodes
   */
  getMyJCodes: async (options = {}) => {
    return apiGet('/api/users/me/jcodes', {
      customErrorMessage: '내 JCode 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * JCode 삭제
   * DELETE /api/users/me/courses/{courseId}/jcodes
   */
  deleteMyJCode: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiDelete(`/api/users/me/courses/${courseId}/jcodes`, {
      customErrorMessage: 'JCode 삭제에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 유틸리티 함수들
  // ===========================================

  /**
   * 내 강의 상세 정보에서 특정 강의 찾기
   */
  findMyCourse: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    const courses = await userService.getMyCoursesDetails({
      ...options,
      showToast: false // 찾기 실패는 조용히 처리
    });

    const foundCourse = courses.find(c => c.courseId === parseInt(courseId));
    
    if (!foundCourse) {
      throw new Error('강의를 찾을 수 없습니다.');
    }

    return foundCourse;
  }
};

export default userService; 