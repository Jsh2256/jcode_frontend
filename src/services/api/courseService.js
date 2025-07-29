import { 
  apiGet
} from '../apiHelpers';

/**
 * 강의 관련 API 서비스
 * 백엔드 API 명세서에 따른 Course API 구현 (일반 사용자용)
 */

const courseService = {
  // ===========================================
  // 4.2 강의 정보 조회
  // ===========================================

  /**
   * 특정 강의 상세 정보 조회
   * GET /api/courses/{courseId}/details
   */
  getCourseDetails: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiGet(`/api/courses/${courseId}/details`, {
      customErrorMessage: '강의 정보를 찾을 수 없습니다.',
      ...options
    });
  },

  /**
   * 특정 강의의 참여자 목록 조회 (STUDENT 제외)
   * GET /api/courses/{courseId}/users
   */
  getCourseUsers: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiGet(`/api/courses/${courseId}/users`, {
      customErrorMessage: '참여자 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 특정 강의의 특정 사용자 정보 조회
   * GET /api/courses/{courseId}/users/{userId}
   */
  getCourseUser: async (courseId, userId, options = {}) => {
    if (!courseId || !userId) {
      throw new Error('강의 ID와 사용자 ID가 필요합니다.');
    }

    return apiGet(`/api/courses/${courseId}/users/${userId}`, {
      customErrorMessage: '사용자 정보를 찾을 수 없습니다.',
      ...options
    });
  },

  // ===========================================
  // 4.3 강의별 과제
  // ===========================================

  /**
   * 특정 강의의 과제 목록 조회
   * GET /api/courses/{courseId}/assignments
   */
  getCourseAssignments: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiGet(`/api/courses/${courseId}/assignments`, {
      customErrorMessage: '과제 목록을 불러올 수 없습니다.',
      ...options
    });
  }
};

export default courseService; 