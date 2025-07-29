import { 
  apiGet, 
  apiGetWithParams
} from '../apiHelpers';
import CacheManager from '../../utils/cache-manager';

/**
 * Watcher 관련 API 서비스
 * 백엔드 API 명세서에 따른 Watcher API 구현
 * 기존의 차트/모니터링 API들을 통합
 */

const watcherService = {
  // ===========================================
  // 8.1 스냅샷 데이터
  // ===========================================

  /**
   * 파일 스냅샷 평균 조회
   * GET /api/watcher/snapshot_avg/files/{fileName}
   */
  getFileSnapshotAverage: async (fileName, params, options = {}) => {
    if (!fileName) {
      throw new Error('파일명이 필요합니다.');
    }

    return apiGetWithParams(`/api/watcher/snapshot_avg/files/${fileName}`, params, {
      customErrorMessage: '파일 스냅샷 평균 조회에 실패했습니다.',
      ...options
    });
  },

  /**
   * 과제 스냅샷 평균 조회
   * GET /api/watcher/assignments/snapshot_avg
   */
  getAssignmentSnapshotAverage: async (params, options = {}) => {
    return apiGetWithParams('/api/watcher/assignments/snapshot_avg', params, {
      customErrorMessage: '과제 스냅샷 평균 조회에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 8.2 로그 데이터
  // ===========================================

  /**
   * Run 로그 조회
   * GET /api/watcher/logs/run
   */
  getRunLogs: async (params, options = {}) => {
    if (!params.course || !params.assignment || !params.user) {
      throw new Error('course, assignment, user 파라미터가 필요합니다.');
    }

    return apiGetWithParams('/api/watcher/logs/run', params, {
      customErrorMessage: 'Run 로그 조회에 실패했습니다.',
      ...options
    });
  },

  /**
   * Build 로그 조회
   * GET /api/watcher/logs/build
   */
  getBuildLogs: async (params, options = {}) => {
    if (!params.course || !params.assignment || !params.user) {
      throw new Error('course, assignment, user 파라미터가 필요합니다.');
    }

    return apiGetWithParams('/api/watcher/logs/build', params, {
      customErrorMessage: 'Build 로그 조회에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 8.3 그래프 데이터
  // ===========================================

  /**
   * 그래프 데이터 조회
   * GET /api/watcher/graph_data/interval/{interval}
   */
  getGraphData: async (interval, params, options = {}) => {
    if (!interval) {
      throw new Error('interval이 필요합니다.');
    }

    if (!params.course || !params.assignment || !params.user) {
      throw new Error('course, assignment, user 파라미터가 필요합니다.');
    }

    return apiGetWithParams(`/api/watcher/graph_data/interval/${interval}`, params, {
      customErrorMessage: '그래프 데이터 조회에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 9. Watcher Selection API
  // ===========================================

  /**
   * 파일 선택 목록 조회
   * GET /api/watcher/selections
   */
  getSelections: async (params, options = {}) => {
    return apiGetWithParams('/api/watcher/selections', params, {
      customErrorMessage: '파일 선택 목록 조회에 실패했습니다.',
      ...options
    });
  },

  /**
   * 타임스탬프 선택 목록 조회
   * GET /api/watcher/selections/files/{filename}
   */
  getFileSelections: async (filename, params, options = {}) => {
    if (!filename) {
      throw new Error('파일명이 필요합니다.');
    }

    return apiGetWithParams(`/api/watcher/selections/files/${filename}`, params, {
      customErrorMessage: '타임스탬프 선택 목록 조회에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 10. Watcher Assignment API
  // ===========================================

  /**
   * 과제 데이터 조회
   * GET /api/watcher/assignments/{assignmentId}/courses/{courseId}
   */
  getAssignmentData: async (assignmentId, courseId, options = {}) => {
    if (!assignmentId || !courseId) {
      throw new Error('과제 ID와 강의 ID가 필요합니다.');
    }

    return apiGet(`/api/watcher/assignments/${assignmentId}/courses/${courseId}`, {
      customErrorMessage: '과제 데이터 조회에 실패했습니다.',
      ...options
    });
  },

  /**
   * 과제 run 평균 조회
   * GET /api/watcher/assignments/{assignmentId}/courses/{courseId}/logs/run
   */
  getAssignmentRunAverage: async (assignmentId, courseId, options = {}) => {
    if (!assignmentId || !courseId) {
      throw new Error('과제 ID와 강의 ID가 필요합니다.');
    }

    return apiGet(`/api/watcher/assignments/${assignmentId}/courses/${courseId}/logs/run`, {
      customErrorMessage: '과제 run 평균 조회에 실패했습니다.',
      ...options
    });
  },

  /**
   * 과제 build 평균 조회
   * GET /api/watcher/assignments/{assignmentId}/courses/{courseId}/logs/build
   */
  getAssignmentBuildAverage: async (assignmentId, courseId, options = {}) => {
    if (!assignmentId || !courseId) {
      throw new Error('과제 ID와 강의 ID가 필요합니다.');
    }

    return apiGet(`/api/watcher/assignments/${assignmentId}/courses/${courseId}/logs/build`, {
      customErrorMessage: '과제 build 평균 조회에 실패했습니다.',
      ...options
    });
  },

  /**
   * 지정 기간 과제 데이터 조회
   * GET /api/watcher/assignments/{assignmentId}/courses/{courseId}/between
   */
  getAssignmentDataBetween: async (assignmentId, courseId, startDate, endDate, options = {}) => {
    if (!assignmentId || !courseId || !startDate || !endDate) {
      throw new Error('과제 ID, 강의 ID, 시작일, 종료일이 필요합니다.');
    }

    // 사용자가 선택한 로컬 시간을 그대로 유지하는 형식으로 변환
    const formatLocalTime = (date) => {
      return date.getFullYear() + 
        '-' + String(date.getMonth() + 1).padStart(2, '0') + 
        '-' + String(date.getDate()).padStart(2, '0') + 
        'T' + String(date.getHours()).padStart(2, '0') + 
        ':' + String(date.getMinutes()).padStart(2, '0') + 
        ':' + String(date.getSeconds()).padStart(2, '0');
    };

    const formattedStartDate = formatLocalTime(startDate);
    const formattedEndDate = formatLocalTime(endDate);

    return apiGetWithParams(`/api/watcher/assignments/${assignmentId}/courses/${courseId}/between`, {
      st: formattedStartDate,
      end: formattedEndDate
    }, {
      customErrorMessage: '기간별 과제 데이터 조회에 실패했습니다.',
      ...options
    });
  },

  // ===========================================
  // 기존 모니터링 데이터 API (캐시 지원)
  // ===========================================

  /**
   * 모니터링 데이터 가져오기 (캐시 지원)
   * 기존 ChartDataService.js의 fetchMonitoringData와 호환
   */
  fetchMonitoringData: async (interval, courseId, assignmentId, userId, options = {}) => {
    const cacheKey = `${interval}_${courseId}_${assignmentId}_${userId}`;
    const cache = CacheManager.getCache('monitoringData');
    
    try {
      // 캐시된 결과가 있으면 반환하되, stale-while-revalidate 패턴을 위해 
      // 백그라운드에서 새로운 데이터를 가져오도록 cachedFetch 사용
      const result = await CacheManager.cachedFetch(
        cacheKey,
        async () => {
          const endpoint = userId
            ? `/courses/${courseId}/assignments/${assignmentId}/monitoring/${userId}?interval=${interval}`
            : `/courses/${courseId}/assignments/${assignmentId}/monitoring?interval=${interval}`;
          
          const response = await apiGet(endpoint, {
            showToast: false,
            ...options
          });
          
          return response;
        },
        'monitoringData',
        300000 // 5분 캐시
      );
      
      return result;
    } catch (error) {
      // 오류 발생 시 캐시에서 가져오기 시도
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      throw error;
    }
  },

  // ===========================================
  // 유틸리티 함수들
  // ===========================================

  /**
   * 시간 단위 계산
   */
  calculateIntervalValue: (timeUnit, value) => {
    const numValue = parseInt(value) || 1;
    
    switch (timeUnit) {
      case 'minute':
        return numValue;
      case 'hour':
        return numValue * 60;
      case 'day':
        return numValue * 60 * 24;
      case 'week':
        return numValue * 60 * 24 * 7;
      case 'month':
        return numValue * 60 * 24 * 30;
      default:
        return 5; // 기본값 5분
    }
  },

  /**
   * Plotly 차트 인스턴스 정리 함수
   */
  cleanupChartInstance: (chartElement, plotlyInstance) => {
    try {
      if (!plotlyInstance) return;

      // DOM 요소가 존재하는지 확인
      if (chartElement) {
        try {
          // Plotly.purge()를 사용하여 차트와 이벤트 리스너를 정리
          plotlyInstance.purge(chartElement);
        } catch (innerError) {
          console.error('플롯 정리 오류:', innerError);
        }
      }
    } catch (error) {
      console.error('차트 정리 중 오류 발생:', error);
    }
  }
};

export default watcherService; 