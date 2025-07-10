import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetWithParams,
  apiParallel 
} from '../apiHelpers';

/**
 * 강의 관련 API 서비스
 */

const courseService = {
  /**
   * 현재 사용자의 강의 목록 조회
   */
  getMyCourses: async (options = {}) => {
    return apiGet('/api/users/me/courses', {
      customErrorMessage: '내 강의 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 현재 사용자의 강의 상세 목록 조회 (과제 포함)
   */
  getMyCoursesDetails: async (options = {}) => {
    return apiGet('/api/users/me/courses/details', {
      customErrorMessage: '강의 상세 정보를 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 특정 강의 상세 정보 조회
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
   * 특정 강의의 참여자 목록 조회
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

  /**
   * 모든 강의 목록 조회 (관리자용)
   */
  getAllCourses: async (options = {}) => {
    return apiGet('/api/courses', {
      customErrorMessage: '강의 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 새 강의 생성 (관리자용)
   */
  createCourse: async (courseData, options = {}) => {
    if (!courseData || typeof courseData !== 'object') {
      throw new Error('유효한 강의 데이터가 필요합니다.');
    }

    // 필수 필드 검증
    const requiredFields = ['courseName', 'courseCode'];
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
   * 강의 정보 수정
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
   * 강의 삭제
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
   * 강의 참가 (참가 코드 사용)
   */
  joinCourse: async (joinData, options = {}) => {
    if (!joinData || !joinData.courseKey) {
      throw new Error('참가 코드가 필요합니다.');
    }

    return apiPost('/api/users/me/courses', joinData, {
      customErrorMessage: '강의 참가에 실패했습니다.',
      ...options
    });
  },

  /**
   * 강의에서 탈퇴
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
   * 내 강의 상세 정보에서 특정 강의 찾기
   */
  findMyCourse: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    const courses = await courseService.getMyCoursesDetails({
      ...options,
      showToast: false // 찾기 실패는 조용히 처리
    });

    const foundCourse = courses.find(c => c.courseId === parseInt(courseId));
    
    if (!foundCourse) {
      throw new Error('강의를 찾을 수 없습니다.');
    }

    return foundCourse;
  },

  /**
   * 강의 검색 (이름 또는 코드로)
   */
  searchCourses: async (query, options = {}) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return apiGetWithParams('/api/courses', 
      { search: query.trim() }, 
      {
        customErrorMessage: '강의 검색에 실패했습니다.',
        showToast: false,
        ...options
      }
    );
  },

  /**
   * 강의 상태별 필터링
   */
  getCoursesByStatus: async (status, options = {}) => {
    if (!status) {
      throw new Error('상태가 필요합니다.');
    }

    return apiGetWithParams('/api/courses', 
      { status }, 
      {
        customErrorMessage: '강의 목록을 불러올 수 없습니다.',
        ...options
      }
    );
  },

  /**
   * 강의와 참여자 정보를 함께 조회
   */
  getCourseWithUsers: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    // 병렬로 강의 정보와 참여자 정보 조회
    const requests = [
      {
        method: 'get',
        url: `/api/courses/${courseId}/details`,
        options: { showToast: false }
      },
      {
        method: 'get', 
        url: `/api/courses/${courseId}/users`,
        options: { showToast: false }
      }
    ];

    try {
      const [courseDetails, courseUsers] = await apiParallel(requests);
      
      return {
        course: courseDetails,
        users: courseUsers
      };
    } catch (error) {
      throw new Error('강의 정보를 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 여러 강의의 정보를 한번에 조회
   */
  getCoursesByIds: async (courseIds, options = {}) => {
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return [];
    }

    const requests = courseIds.map(courseId => ({
      method: 'get',
      url: `/api/courses/${courseId}/details`,
      options: { showToast: false }
    }));

    try {
      return await apiParallel(requests);
    } catch (error) {
      console.warn('Some course requests failed:', error);
      return [];
    }
  },

  /**
   * 강의 통계 정보 조회 (관리자용)
   */
  getCourseStats: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiGet(`/api/courses/${courseId}/stats`, {
      customErrorMessage: '강의 통계를 불러올 수 없습니다.',
      showToast: false,
      ...options
    });
  }
};

export default courseService; 