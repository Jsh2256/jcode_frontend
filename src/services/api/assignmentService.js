import apiClient from '../apiClient';

/**
 * 과제 관련 API 서비스
 */

const assignmentService = {
  /**
   * 특정 강의의 과제 목록 조회
   */
  getCourseAssignments: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiClient.get(`/api/courses/${courseId}/assignments`, {
      customErrorMessage: '과제 목록을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 특정 과제 상세 정보 조회
   */
  getAssignmentDetails: async (courseId, assignmentId, options = {}) => {
    if (!courseId || !assignmentId) {
      throw new Error('강의 ID와 과제 ID가 필요합니다.');
    }

    return apiClient.get(`/api/courses/${courseId}/assignments/${assignmentId}`, {
      customErrorMessage: '과제 정보를 찾을 수 없습니다.',
      ...options
    });
  },

  /**
   * 새 과제 생성
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

    return apiClient.post(`/api/courses/${courseId}/assignments`, assignmentData, {
      customErrorMessage: '과제 생성에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 과제 정보 수정
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

    return apiClient.put(`/api/courses/${courseId}/assignments/${assignmentId}`, assignmentData, {
      customErrorMessage: '과제 수정에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 과제 삭제
   */
  deleteAssignment: async (courseId, assignmentId, options = {}) => {
    if (!courseId || !assignmentId) {
      throw new Error('강의 ID와 과제 ID가 필요합니다.');
    }

    return apiClient.delete(`/api/courses/${courseId}/assignments/${assignmentId}`, {
      customErrorMessage: '과제 삭제에 실패했습니다.',
      showToast: true,
      ...options
    });
  },

  /**
   * 과제 코드 중복 확인
   */
  checkAssignmentCodeExists: async (courseId, assignmentName, options = {}) => {
    if (!courseId || !assignmentName) {
      return false;
    }

    try {
      const assignments = await assignmentService.getCourseAssignments(courseId, {
        ...options,
        showToast: false
      });
      
      return assignments.some(assignment => assignment.assignmentName === assignmentName);
    } catch (error) {
      console.warn('Failed to check assignment code:', error);
      return false;
    }
  },

  /**
   * 과제 상태별 필터링
   */
  getAssignmentsByStatus: async (courseId, status, options = {}) => {
    if (!courseId || !status) {
      throw new Error('강의 ID와 상태가 필요합니다.');
    }

    return apiClient.getWithParams(`/api/courses/${courseId}/assignments`, 
      { status }, 
      {
        customErrorMessage: '과제 목록을 불러올 수 없습니다.',
        ...options
      }
    );
  },

  /**
   * 마감 임박 과제 조회
   */
  getUpcomingAssignments: async (courseId, days = 7, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    return apiClient.getWithParams(`/api/courses/${courseId}/assignments`, 
      { upcoming: days }, 
      {
        customErrorMessage: '마감 임박 과제를 불러올 수 없습니다.',
        showToast: false,
        ...options
      }
    );
  },

  /**
   * 과제 검색
   */
  searchAssignments: async (courseId, query, options = {}) => {
    if (!courseId || !query || query.trim().length < 2) {
      return [];
    }

    return apiClient.getWithParams(`/api/courses/${courseId}/assignments`, 
      { search: query.trim() }, 
      {
        customErrorMessage: '과제 검색에 실패했습니다.',
        showToast: false,
        ...options
      }
    );
  },

  /**
   * 여러 과제 정보를 한번에 조회
   */
  getAssignmentsByIds: async (courseId, assignmentIds, options = {}) => {
    if (!courseId || !assignmentIds || !Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return [];
    }

    const requests = assignmentIds.map(assignmentId => ({
      method: 'get',
      url: `/api/courses/${courseId}/assignments/${assignmentId}`,
      options: { showToast: false }
    }));

    try {
      return await apiClient.parallel(requests);
    } catch (error) {
      console.warn('Some assignment requests failed:', error);
      return [];
    }
  },

  /**
   * 과제 통계 조회
   */
  getAssignmentStats: async (courseId, assignmentId, options = {}) => {
    if (!courseId || !assignmentId) {
      throw new Error('강의 ID와 과제 ID가 필요합니다.');
    }

    return apiClient.get(`/api/courses/${courseId}/assignments/${assignmentId}/stats`, {
      customErrorMessage: '과제 통계를 불러올 수 없습니다.',
      showToast: false,
      ...options
    });
  },

  /**
   * 과제 제출 현황 조회
   */
  getAssignmentSubmissions: async (courseId, assignmentId, options = {}) => {
    if (!courseId || !assignmentId) {
      throw new Error('강의 ID와 과제 ID가 필요합니다.');
    }

    return apiClient.get(`/api/courses/${courseId}/assignments/${assignmentId}/submissions`, {
      customErrorMessage: '제출 현황을 불러올 수 없습니다.',
      ...options
    });
  },

  /**
   * 과제 복사 (다른 강의로)
   */
  copyAssignment: async (fromCourseId, assignmentId, toCourseId, options = {}) => {
    if (!fromCourseId || !assignmentId || !toCourseId) {
      throw new Error('원본 강의 ID, 과제 ID, 대상 강의 ID가 필요합니다.');
    }

    return apiClient.post(`/api/courses/${toCourseId}/assignments/copy`, {
      fromCourseId,
      assignmentId
    }, {
      customErrorMessage: '과제 복사에 실패했습니다.',
      showToast: true,
      ...options
    });
  }
};

export default assignmentService; 