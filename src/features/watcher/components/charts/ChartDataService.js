import api from '../../../../api/axios';
import CacheManager from '../../../../utils/cache-manager';

// 시간 간격 계산 함수
export const calculateIntervalValue = (timeUnit, minuteValue) => {
  switch(timeUnit) {
    case 'minute':
      return parseInt(minuteValue);
    case 'hour':
      return 60;  // 60분
    case 'day':
      return 60 * 24;  // 1일 (분 단위)
    case 'week':
      return 60 * 24 * 7;  // 1주 (분 단위)
    case 'month':
      return 60 * 24 * 30;  // 30일 (분 단위)
    default:
      return 5;  // 기본값 5분
  }
};

// 데이터 가져오기 함수 (최적화) - 싱글톤 캐시 매니저 사용
export const fetchMonitoringData = async (intervalValue, courseId, assignmentId, userId) => {
  // API 요청 생성
  const params = new URLSearchParams({
    course: courseId,
    assignment: assignmentId,
    user: userId
  });

  const response = await api.get(`/api/watcher/graph_data/interval/${intervalValue}?${params}`);
  return response.data;
};

// 캐시 무효화 함수
export const invalidateMonitoringCache = (intervalValue, courseId, assignmentId, userId) => {
  const cacheKey = `${intervalValue}_${courseId}_${assignmentId}_${userId}`;
  CacheManager.invalidateCache(cacheKey, 'monitoringData');
};

// ISO 형식 (YYYY-MM-DD HH:MM:SS)으로 날짜 포맷 변환
export const formatDateToISO = (dateStr) => {
  if (!dateStr) return '';
  
  // 타임스탬프 형식 변환 (YYYYMMDD_HHMM -> YYYY-MM-DD HH:MM)
  try {
    // 원본 형식: YYYYMMDD_HHMM -> 변환: YYYY-MM-DD HH:MM
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/);
    if (match) {
      const [_, year, month, day, hour, minute] = match;
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    
    // 이미 다른 형식이면 그대로 반환
    return dateStr;
  } catch (error) {
    //console.error('날짜 변환 오류:', error);
    return dateStr;
  }
};

// 데이터 처리 함수
export const processChartData = (rawData, assignment) => {
  // 데이터가 없거나 유효하지 않은 경우 기본값 반환
  if (!rawData || !rawData.trends || !Array.isArray(rawData.trends)) {
    //console.warn('유효한 데이터가 없습니다:', rawData);
    return {
      timeData: [],
      timestamps: [],
      totalBytes: [],
      changeBytes: [],
      formattedTimes: [],
      additions: [],
      deletions: []
    };
  }
  
  
  // 데이터 항목에 timestamp가 없는 경우 처리 방법 수정
  const timeData = rawData.trends.map((item, index) => {
    if (!item.timestamp) {
      //console.warn('timestamp가 없는 데이터 항목:', item);
    }
    
    // timestamp 형식 변환 (YYYYMMDD_HHMM -> YYYY-MM-DD HH:MM)
    let formattedTime = '';
    let timestamp = null;
    
    if (item.timestamp) {
      try {
        // 원본 형식: YYYYMMDD_HHMM -> 변환: YYYY-MM-DD HH:MM
        const match = item.timestamp.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})$/);
        if (match) {
          const [_, year, month, day, hour, minute] = match;
          const dateStr = `${year}-${month}-${day} ${hour}:${minute}`;
          timestamp = new Date(dateStr).getTime();
          formattedTime = `${year}-${month}-${day} ${hour}:${minute}`;
        } else {
          //console.warn('타임스탬프 형식 오류:', item.timestamp);
          // 가상 타임스탬프 사용
          timestamp = new Date().getTime() - (rawData.trends.length - index) * 60000;
          const date = new Date(timestamp);
          formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
      } catch (error) {
        //console.error('타임스탬프 파싱 오류:', error);
        // 가상 타임스탬프 사용
        timestamp = new Date().getTime() - (rawData.trends.length - index) * 60000;
        const date = new Date(timestamp);
        formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
    } else {
      // 타임스탬프가 없는 경우 가상의 타임스탬프 생성
      timestamp = new Date().getTime() - (rawData.trends.length - index) * 60000;
      const date = new Date(timestamp);
      formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    // size_change가 양수이면 추가, 음수이면 삭제
    const sizeChange = item.size_change || 0;
    const additions = sizeChange > 0 ? sizeChange : 0;
    const deletions = sizeChange < 0 ? Math.abs(sizeChange) : 0;
    
    return {
      time: timestamp,
      totalBytes: item.total_size || 0,
      changeBytes: sizeChange,
      additions: additions,
      deletions: deletions,
      formattedTime: formattedTime
    };
  });
  
  // 시간순으로 정렬
  timeData.sort((a, b) => a.time - b.time);
  
  const result = {
    timeData: timeData,
    timestamps: timeData.map(d => d.time),
    totalBytes: timeData.map(d => d.totalBytes),
    changeBytes: timeData.map(d => d.changeBytes),
    formattedTimes: timeData.map(d => d.formattedTime),
    additions: timeData.map(d => d.additions),
    deletions: timeData.map(d => d.deletions)
  };
    
  return result;
};

// 학생 정보 가져오기 함수
export const fetchStudentInfo = async (courseId, userId) => {
  try {
    // 디버깅을 위한 로그 추가
    
    // API 엔드포인트 수정 - 여러 경로 시도
    let studentData = null;
    
    try {
      // 첫 번째 경로 시도
      const userResponse = await api.get(`/api/courses/${courseId}/users`);
      studentData = userResponse.data;
    } catch (error1) {
      //console.warn('첫 번째 경로에서 학생 정보를 가져오는데 실패했습니다:', error1);
      
      try {
        // 두 번째 경로 시도
        const usersResponse = await api.get(`/api/courses/${courseId}/users`);
        
        // 사용자 목록에서 userId와 일치하는 항목 찾기
        studentData = usersResponse.data.find(user => 
          user.userId === parseInt(userId) || 
          user.id === parseInt(userId) || 
          user.studentId === userId
        );
        
        if (studentData) {
        } else {
          //console.warn('두 번째 경로에서도 학생 정보를 찾을 수 없습니다.');
        }
      } catch (error2) {
        //console.warn('두 번째 경로에서도 학생 정보를 가져오는데 실패했습니다:', error2);
      }
    }
    
    // 여전히 데이터가 없으면 기본 객체 생성
    if (!studentData) {
      studentData = {
        id: userId,
        userId: parseInt(userId),
        studentId: '정보 없음',
        studentNum: '정보 없음',
        name: '정보 없음',
        userName: '정보 없음',
        email: '정보 없음',
        userEmail: '정보 없음'
      };
    }
    
    return studentData;
  } catch (userError) {
    // 기본 객체 반환
    return {
      id: userId,
      userId: parseInt(userId),
      studentId: '정보 없음',
      studentNum: '정보 없음',
      name: '정보 없음',
      userName: '정보 없음',
      email: '정보 없음',
      userEmail: '정보 없음'
    };
  }
};

// 과제 정보 가져오기 함수
export const fetchAssignmentInfo = async (courseId, assignmentId) => {
  try {
    const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
 
    const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
    
    if (!currentAssignment) {
      throw new Error('과제를 찾을 수 없습니다.');
    }
    
       
    // 날짜 속성들이 있는지 확인
    if (currentAssignment.kickoffDate) {
    }
    if (currentAssignment.deadlineDate) {
    }
    if (currentAssignment.startDateTime) {
    }
    if (currentAssignment.endDateTime) {
    }
    
    // 응답 객체에 시작일과 종료일 속성이 없는 경우 추가
    if (!currentAssignment.startDate && (currentAssignment.kickoffDate || currentAssignment.startDateTime)) {
      currentAssignment.startDate = currentAssignment.kickoffDate || currentAssignment.startDateTime;
    }
    
    if (!currentAssignment.endDate && (currentAssignment.deadlineDate || currentAssignment.endDateTime)) {
      currentAssignment.endDate = currentAssignment.deadlineDate || currentAssignment.endDateTime;
    }
    
    return currentAssignment;
  } catch (error) {
    throw error;
  }
};

// 강의 정보 가져오기 함수
export const fetchCourseInfo = async (courseId) => {
  try {
    const coursesResponse = await api.get('/api/users/me/courses/details');
    const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
    
    if (!foundCourse) {
      throw new Error('강의를 찾을 수 없습니다.');
    }
    
    return foundCourse;
  } catch (error) {
    throw error;
  }
};

// 사용자 ID로 사용자 정보 직접 조회 함수
export const fetchUserById = async (userId) => {
  try {
    //console.log(`사용자 직접 조회 시작: ID=${userId}`);
    const response = await api.get(`/api/users/${userId}`);
    //console.log('사용자 정보 응답:', response.data);
    return response.data;
  } catch (error) {
    //console.error(`사용자 정보 조회 실패(ID=${userId}):`, error);
    // 기본 사용자 객체 반환
    return {
      id: userId,
      userId: parseInt(userId),
      studentId: '정보 없음',
      studentNum: '정보 없음',
      name: '정보 없음',
      email: '정보 없음'
    };
  }
}; 