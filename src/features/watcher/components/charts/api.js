import api from '../../../../api/axios';
import { fetchMonitoringData as fetchMonitoringDataService } from './ChartDataService';

// 모니터링 데이터 가져오기
export const fetchMonitoringData = async (intervalValue, courseId, assignmentId, userId) => {
  return fetchMonitoringDataService(intervalValue, courseId, assignmentId, userId);
};

// 학생 정보 가져오기
export const fetchStudentInfo = async (courseId, userId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/users/${userId}`);
    return response.data;
  } catch (error) {
    //.error('학생 정보 가져오기 오류:', error);
    throw error;
  }
};

// 과제 정보 가져오기
export const fetchAssignmentInfo = async (courseId, assignmentId) => {
  try {
    const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
    const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
    
    if (!currentAssignment) {
      throw new Error('과제를 찾을 수 없습니다.');
    }
    
    return currentAssignment;
  } catch (error) {
    //console.error('과제 정보 가져오기 오류:', error);
    // 에러가 발생하면 기본 정보를 반환합니다
    return { 
      id: assignmentId,
      title: '정보를 불러올 수 없음', 
      description: '서버 오류로 과제 정보를 불러올 수 없습니다.',
      error: true
    };
  }
};

// 강의 정보 가져오기
export const fetchCourseInfo = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/details`);
    return response.data;
  } catch (error) {
    //console.error('강의 정보 가져오기 오류:', error);
    throw error;
  }
};

// 차트 데이터 시간 단위별 가져오기
export const fetchChartDataByTimeRange = async (courseId, assignmentId, startDate, endDate) => {
  try {
    // 디버깅을 위한 로그 추가
    //console.log('차트 데이터 요청 매개변수:', { courseId, assignmentId, startDate, endDate });
    
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
    
    //console.log('변환된 날짜 형식:', { st: formattedStartDate, end: formattedEndDate });
    
    const response = await api.get(`/api/watcher/assignments/${assignmentId}/courses/${courseId}/between`, {
      params: {
        st: formattedStartDate,
        end: formattedEndDate
      }
    });
    
    //console.log('차트 데이터 응답:', response.data);
    
    let results = response.data.results || [];
    //console.log('원본 차트 데이터:', results);
    
    // 결과가 비어있는 경우 기본 데이터 추가
    if (results.length === 0) {
      //console.log('데이터가 비어있어 기본 테스트 데이터를 사용합니다');
      // 테스트 데이터 생성
      results = [
      ];
    }
    
    //console.log('최종 반환할 차트 데이터:', results);
    return results;
  } catch (error) {
    //console.error('차트 데이터 로딩 오류:', error);
    // 오류 발생 시 기본 테스트 데이터 반환
    //console.log('오류가 발생하여 기본 테스트 데이터를 사용합니다');
    return [
    ];
  }
};

// JCode로 리다이렉트
export const redirectToJCode = async (email, courseId) => {
  try {
    const response = await api.post('/api/redirect', {
      userEmail: email,
      courseId: courseId
    }, { withCredentials: true });
    
    return response.request?.responseURL || response.data?.url;
  } catch (error) {
    //console.error('JCode 리다이렉션 오류:', error);
    throw error;
  }
};

// 시간 단위 계산
export const calculateIntervalValue = (timeUnit, value) => {
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
};

// 과제에 등록된 학생 목록 가져오기
export const fetchStudents = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/users`);
    return response.data || [];
  } catch (error) {
    //console.error('학생 목록 가져오기 오류:', error);
    throw error;
  }
};

// Plotly 차트 인스턴스 정리 함수
export const cleanupChartInstance = (chartElement, plotlyInstance) => {
  try {
    if (!plotlyInstance) return;

    // DOM 요소가 존재하는지 확인
    if (chartElement) {
      try {
        // Plotly는 removeAllListeners 메서드를 제공하지 않음
        // 대신 Plotly.purge()만 사용하여 차트와 이벤트 리스너를 정리
        plotlyInstance.purge(chartElement);
      } catch (innerError) {
        //console.error('플롯 정리 오류:', innerError);
      }
    }
  } catch (error) {
    //console.error('차트 정리 중 오류 발생:', error);
  }
};

// 사용자 강의 세부 정보 가져오기
export const fetchUserCoursesDetails = async () => {
  try {
    const response = await api.get('/api/users/me/courses/details');
    return response.data;
  } catch (error) {
    //console.error('사용자 강의 세부 정보 가져오기 오류:', error);
    throw error;
  }
}; 