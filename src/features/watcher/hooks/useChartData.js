import { useState, useEffect, useCallback } from 'react';
import { fetchChartDataByTimeRange, fetchMonitoringData } from '../components/charts/api';

export const useChartData = (courseId, assignmentId) => {
  const [chartData, setChartData] = useState([]);
  const [selectedStudentData, setSelectedStudentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // 차트 데이터 로드
  const loadChartData = useCallback(async (startDate, endDate, studentEmail = null) => {
    if (!courseId || !assignmentId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await fetchChartDataByTimeRange(
        courseId, 
        assignmentId, 
        startDate, 
        endDate
      );

      if (studentEmail) {
        // 특정 학생 데이터만 필터링
        const studentData = data.filter(item => item.userEmail === studentEmail);
        setSelectedStudentData(studentData);
      } else {
        // 전체 데이터
        setChartData(data || []);
      }

      setSelectedTimeRange({ startDate, endDate });
    } catch (err) {
      console.error('차트 데이터 로드 실패:', err);
      setError(err.message || '차트 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId]);

  // 학생별 데이터 로드
  const loadStudentData = useCallback(async (studentEmail, startDate, endDate) => {
    if (!studentEmail) {
      setSelectedStudentData([]);
      setSelectedStudent(null);
      return;
    }

    try {
      setLoading(true);
      
      const data = await fetchChartDataByTimeRange(
        courseId, 
        assignmentId, 
        startDate, 
        endDate
      );

      const studentData = data.filter(item => item.userEmail === studentEmail);
      setSelectedStudentData(studentData);
      setSelectedStudent(studentEmail);
    } catch (err) {
      console.error('학생 데이터 로드 실패:', err);
      setError(err.message || '학생 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId]);

  // 모니터링 데이터 로드 (스냅샷 대체)
  const loadMonitoringData = useCallback(async (intervalValue, userId) => {
    try {
      setLoading(true);
      
      const monitoringData = await fetchMonitoringData(
        intervalValue || 5, // 기본 5분 간격
        courseId, 
        assignmentId, 
        userId
      );

      return monitoringData || [];
    } catch (err) {
      console.error('모니터링 데이터 로드 실패:', err);
      setError(err.message || '모니터링 데이터를 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId]);

  // 차트 데이터 변환 함수들
  const transformTotalSizeData = (data = chartData) => {
    return data.map(item => ({
      timestamp: new Date(item.snapshotTime),
      value: item.totalSize || 0,
      userEmail: item.userEmail,
      snapshotId: item.snapshotId
    }));
  };

  const transformChangeData = (data = chartData) => {
    return data.map(item => ({
      timestamp: new Date(item.snapshotTime),
      changes: item.totalChange || 0,
      userEmail: item.userEmail,
      snapshotId: item.snapshotId
    }));
  };

  // 학생별 차트 데이터
  const getStudentChartData = (studentEmail) => {
    return chartData.filter(item => item.userEmail === studentEmail);
  };

  // 시간대별 집계 데이터
  const getAggregatedData = (timeInterval = 'hour') => {
    const aggregated = {};
    
    chartData.forEach(item => {
      const date = new Date(item.snapshotTime);
      let key;
      
      switch (timeInterval) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
          break;
        default:
          key = date.toISOString();
      }
      
      if (!aggregated[key]) {
        aggregated[key] = {
          timestamp: key,
          totalSize: 0,
          totalChanges: 0,
          count: 0
        };
      }
      
      aggregated[key].totalSize += item.totalSize || 0;
      aggregated[key].totalChanges += item.totalChange || 0;
      aggregated[key].count += 1;
    });
    
    return Object.values(aggregated);
  };

  // 통계 데이터 계산
  const getStatistics = () => {
    if (!chartData.length) return null;

    const totalSize = chartData.reduce((sum, item) => sum + (item.totalSize || 0), 0);
    const totalChanges = chartData.reduce((sum, item) => sum + (item.totalChange || 0), 0);
    const avgSize = totalSize / chartData.length;
    const avgChanges = totalChanges / chartData.length;
    
    const uniqueStudents = new Set(chartData.map(item => item.userEmail)).size;
    
    return {
      totalSize,
      totalChanges,
      avgSize,
      avgChanges,
      dataPoints: chartData.length,
      uniqueStudents
    };
  };

  // 차트 데이터 새로고침
  const refreshChartData = () => {
    if (selectedTimeRange) {
      loadChartData(selectedTimeRange.startDate, selectedTimeRange.endDate);
    }
  };

  // 선택된 학생 초기화
  const clearSelectedStudent = () => {
    setSelectedStudent(null);
    setSelectedStudentData([]);
  };

  return {
    // 상태
    chartData,
    selectedStudentData,
    loading,
    error,
    selectedStudent,
    selectedTimeRange,
    
    // 계산된 값
    totalSizeData: transformTotalSizeData(),
    changeData: transformChangeData(),
    statistics: getStatistics(),
    
    // 액션
    loadChartData,
    loadStudentData,
    loadMonitoringData,
    refreshChartData,
    clearSelectedStudent,
    setSelectedStudent,
    
    // 변환 함수
    transformTotalSizeData,
    transformChangeData,
    getStudentChartData,
    getAggregatedData
  };
}; 