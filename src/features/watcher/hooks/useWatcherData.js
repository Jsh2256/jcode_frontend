import { useState, useEffect, useCallback } from 'react';
import { 
  fetchMonitoringData,
  processChartData,
  fetchStudentInfo,
  fetchAssignmentInfo,
  fetchCourseInfo
} from '../components/charts/ChartDataService';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * 워처 데이터 관리 커스텀 훅
 * @param {string} courseId - 강의 ID
 * @param {string} assignmentId - 과제 ID (선택사항)
 * @param {string} userId - 사용자 ID (선택사항)
 */
export const useWatcherData = (courseId, assignmentId, userId) => {
  const { user } = useAuth();
  const [data, setData] = useState({
    course: null,
    assignment: null,
    student: null,
    chartData: [],
    monitoringData: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 강의 정보 로드
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return null;
    try {
      const courseData = await fetchCourseInfo(courseId);
      return courseData;
    } catch (error) {
      console.error('강의 정보 로드 실패:', error);
      throw error;
    }
  }, [courseId]);

  // 과제 정보 로드
  const fetchAssignmentData = useCallback(async () => {
    if (!courseId || !assignmentId) return null;
    try {
      const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
      // 배열인 경우 특정 과제 찾기
      if (Array.isArray(assignmentData)) {
        return assignmentData.find(a => a.assignmentId === parseInt(assignmentId)) || null;
      }
      return assignmentData;
    } catch (error) {
      console.error('과제 정보 로드 실패:', error);
      throw error;
    }
  }, [courseId, assignmentId]);

  // 학생 정보 로드
  const fetchStudentData = useCallback(async () => {
    if (!userId) return null;
    try {
      const studentData = await fetchStudentInfo(userId);
      return studentData;
    } catch (error) {
      console.error('학생 정보 로드 실패:', error);
      throw error;
    }
  }, [userId]);

  // 모니터링 데이터 로드
  const fetchMonitoringDataForWatcher = useCallback(async () => {
    if (!courseId || !assignmentId || !userId) return null;
    try {
      const monitoringData = await fetchMonitoringData(courseId, assignmentId, userId);
      return monitoringData;
    } catch (error) {
      console.error('모니터링 데이터 로드 실패:', error);
      throw error;
    }
  }, [courseId, assignmentId, userId]);

  // 차트 데이터 처리
  const processWatcherChartData = useCallback(async (rawData) => {
    if (!rawData) return [];
    try {
      const processedData = await processChartData(rawData);
      return processedData;
    } catch (error) {
      console.error('차트 데이터 처리 실패:', error);
      throw error;
    }
  }, []);

  // 전체 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const promises = [];
      
      // 필요한 데이터만 로드
      if (courseId) promises.push(fetchCourseData());
      if (assignmentId) promises.push(fetchAssignmentData());
      if (userId) promises.push(fetchStudentData());
      if (courseId && assignmentId && userId) promises.push(fetchMonitoringDataForWatcher());

      const results = await Promise.allSettled(promises);
      
      let courseData = null, assignmentData = null, studentData = null, monitoringData = null;
      let index = 0;

      if (courseId) {
        courseData = results[index].status === 'fulfilled' ? results[index].value : null;
        index++;
      }
      if (assignmentId) {
        assignmentData = results[index].status === 'fulfilled' ? results[index].value : null;
        index++;
      }
      if (userId) {
        studentData = results[index].status === 'fulfilled' ? results[index].value : null;
        index++;
      }
      if (courseId && assignmentId && userId) {
        monitoringData = results[index].status === 'fulfilled' ? results[index].value : null;
      }

      // 차트 데이터 처리
      const chartData = monitoringData ? await processWatcherChartData(monitoringData) : [];

      setData({
        course: courseData,
        assignment: assignmentData,
        student: studentData,
        chartData,
        monitoringData
      });

    } catch (error) {
      setError(error.message || '데이터 로드 중 오류가 발생했습니다.');
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId, userId, fetchCourseData, fetchAssignmentData, fetchStudentData, fetchMonitoringDataForWatcher, processWatcherChartData]);

  // 데이터 새로고침
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refreshData,
    user
  };
}; 