import { 
  apiGet
} from '../apiHelpers';

/**
 * 과제 관련 API 서비스 (조회 전용)
 * 백엔드 API 명세서에 따른 Assignment API 구현
 * 
 * 참고: 과제 CRUD (생성, 수정, 삭제)는 adminService.js에 있습니다.
 */

const assignmentService = {
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
  },

  /**
   * 과제 목록에서 특정 과제 찾기 (유틸리티 함수)
   */
  findAssignmentInCourse: async (courseId, assignmentId, options = {}) => {
    if (!courseId || !assignmentId) {
      throw new Error('강의 ID와 과제 ID가 필요합니다.');
    }

    const assignments = await assignmentService.getCourseAssignments(courseId, {
      ...options,
      showToast: false // 찾기 실패는 조용히 처리
    });

    const foundAssignment = assignments.find(a => a.assignmentId === parseInt(assignmentId));
    
    if (!foundAssignment) {
      throw new Error('과제를 찾을 수 없습니다.');
    }

    return foundAssignment;
  },

  /**
   * 과제 상태 확인 (마감일 기준)
   */
  getAssignmentStatus: (assignment) => {
    if (!assignment || !assignment.deadlineDate) {
      return 'unknown';
    }

    const now = new Date();
    const deadline = new Date(assignment.deadlineDate);
    const kickoff = new Date(assignment.kickoffDate);

    if (now < kickoff) {
      return 'not_started'; // 시작 전
    } else if (now > deadline) {
      return 'ended'; // 마감됨
    } else {
      return 'active'; // 진행 중
    }
  },

  /**
   * 남은 시간 계산
   */
  getRemainingTime: (assignment) => {
    if (!assignment || !assignment.deadlineDate) {
      return null;
    }

    const now = new Date();
    const deadline = new Date(assignment.deadlineDate);
    const timeDiff = deadline.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, minutes };
  }
};

export default assignmentService; 