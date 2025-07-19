import { useState, useCallback, useMemo } from 'react';
import { fetchMonitoringData } from '../components/charts/api';

export const useLogData = (courseId, assignmentId) => {
  const [buildLogs, setBuildLogs] = useState([]);
  const [runLogs, setRunLogs] = useState([]);
  const [logAverage, setLogAverage] = useState([]);
  const [snapshotAverage, setSnapshotAverage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 로그 필터 상태
  const [logFilters, setLogFilters] = useState({
    showBuildLogs: true,
    showRunLogs: true,
    showLogAverage: false,
    showSnapshotAverage: false
  });

  // 모니터링 데이터를 통한 로그 데이터 로드 (실제 로그 API가 없으므로 대체)
  const loadLogDataFromMonitoring = useCallback(async (intervalValue, userId) => {
    if (!courseId || !assignmentId) return;

    try {
      setLoading(true);
      setError(null);
      
      // 실제 로그 API가 없으므로 모니터링 데이터를 활용
      const monitoringData = await fetchMonitoringData(
        intervalValue || 5,
        courseId, 
        assignmentId, 
        userId
      );

      // 모니터링 데이터를 로그 형태로 변환 (예시)
      if (monitoringData && Array.isArray(monitoringData)) {
        const mockBuildLogs = monitoringData.map((item, index) => ({
          id: `build_${index}`,
          timestamp: item.snapshotTime || new Date().toISOString(),
          message: `Build log ${index + 1}`,
          status: index % 2 === 0 ? 'SUCCESS' : 'FAILED',
          userEmail: item.userEmail || 'unknown@example.com',
          type: 'build'
        }));

        const mockRunLogs = monitoringData.map((item, index) => ({
          id: `run_${index}`,
          timestamp: item.snapshotTime || new Date().toISOString(),
          message: `Run log ${index + 1}`,
          status: index % 3 === 0 ? 'COMPLETED' : 'RUNNING',
          userEmail: item.userEmail || 'unknown@example.com',
          type: 'run'
        }));

        setBuildLogs(mockBuildLogs);
        setRunLogs(mockRunLogs);
      }
    } catch (err) {
      console.error('로그 데이터 로드 실패:', err);
      setError(err.message || '로그 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId]);

  // 빌드 로그 로드 (플레이스홀더)
  const loadBuildLogs = useCallback(async (startDate, endDate) => {
    console.log('빌드 로그 API가 구현되지 않았습니다. 모니터링 데이터를 사용해주세요.');
    setBuildLogs([]);
  }, []);

  // 실행 로그 로드 (플레이스홀더)
  const loadRunLogs = useCallback(async (startDate, endDate) => {
    console.log('실행 로그 API가 구현되지 않았습니다. 모니터링 데이터를 사용해주세요.');
    setRunLogs([]);
  }, []);

  // 로그 평균 데이터 로드 (플레이스홀더)
  const loadLogAverage = useCallback(async (startDate, endDate) => {
    console.log('로그 평균 API가 구현되지 않았습니다.');
    setLogAverage([]);
  }, []);

  // 스냅샷 평균 데이터 로드 (플레이스홀더)
  const loadSnapshotAverage = useCallback(async (startDate, endDate) => {
    console.log('스냅샷 평균 API가 구현되지 않았습니다.');
    setSnapshotAverage([]);
  }, []);

  // 모든 로그 데이터 로드
  const loadAllLogData = useCallback(async (startDate, endDate) => {
    console.log('통합 로그 로딩은 현재 지원되지 않습니다. loadLogDataFromMonitoring을 사용해주세요.');
  }, []);

  // 로그 필터 토글
  const toggleLogFilter = useCallback((filterName) => {
    setLogFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  }, []);

  // 모든 필터 토글
  const toggleAllFilters = useCallback((enabled) => {
    setLogFilters({
      showBuildLogs: enabled,
      showRunLogs: enabled,
      showLogAverage: enabled,
      showSnapshotAverage: enabled
    });
  }, []);

  // 필터링된 로그 데이터
  const filteredLogs = useMemo(() => {
    const logs = [];
    
    if (logFilters.showBuildLogs) {
      logs.push(...buildLogs.map(log => ({ ...log, type: 'build' })));
    }
    
    if (logFilters.showRunLogs) {
      logs.push(...runLogs.map(log => ({ ...log, type: 'run' })));
    }
    
    if (logFilters.showLogAverage) {
      logs.push(...logAverage.map(log => ({ ...log, type: 'logAverage' })));
    }
    
    if (logFilters.showSnapshotAverage) {
      logs.push(...snapshotAverage.map(log => ({ ...log, type: 'snapshotAverage' })));
    }
    
    // 시간순으로 정렬
    return logs.sort((a, b) => new Date(b.timestamp || b.snapshotTime) - new Date(a.timestamp || a.snapshotTime));
  }, [buildLogs, runLogs, logAverage, snapshotAverage, logFilters]);

  // 로그 검색 필터링
  const searchLogs = useCallback((logs, searchQuery) => {
    if (!searchQuery.trim()) return logs;
    
    const query = searchQuery.toLowerCase();
    
    return logs.filter(log => {
      return (
        (log.userEmail && log.userEmail.toLowerCase().includes(query)) ||
        (log.message && log.message.toLowerCase().includes(query)) ||
        (log.type && log.type.toLowerCase().includes(query)) ||
        (log.status && log.status.toLowerCase().includes(query))
      );
    });
  }, []);

  // 로그 통계 계산
  const getLogStatistics = useMemo(() => {
    const stats = {
      total: filteredLogs.length,
      buildLogs: buildLogs.length,
      runLogs: runLogs.length,
      logAverage: logAverage.length,
      snapshotAverage: snapshotAverage.length,
      successRate: 0,
      failureRate: 0
    };
    
    // 성공/실패율 계산 (빌드, 실행 로그만)
    const executableLogs = [...buildLogs, ...runLogs];
    if (executableLogs.length > 0) {
      const successCount = executableLogs.filter(log => 
        log.status === 'SUCCESS' || log.status === 'COMPLETED'
      ).length;
      
      stats.successRate = ((successCount / executableLogs.length) * 100).toFixed(1);
      stats.failureRate = (((executableLogs.length - successCount) / executableLogs.length) * 100).toFixed(1);
    }
    
    return stats;
  }, [buildLogs, runLogs, logAverage, snapshotAverage, filteredLogs]);

  // 특정 사용자 로그 필터링
  const getUserLogs = useCallback((userEmail) => {
    return filteredLogs.filter(log => log.userEmail === userEmail);
  }, [filteredLogs]);

  // 로그 타입별 데이터 가져오기
  const getLogsByType = useCallback((type) => {
    switch (type) {
      case 'build':
        return buildLogs;
      case 'run':
        return runLogs;
      case 'logAverage':
        return logAverage;
      case 'snapshotAverage':
        return snapshotAverage;
      default:
        return filteredLogs;
    }
  }, [buildLogs, runLogs, logAverage, snapshotAverage, filteredLogs]);

  // 로그 새로고침
  const refreshLogs = useCallback((startDate, endDate) => {
    console.log('로그 새로고침 기능은 현재 지원되지 않습니다. loadLogDataFromMonitoring을 사용해주세요.');
  }, []);

  // 로그 초기화
  const clearLogs = useCallback(() => {
    setBuildLogs([]);
    setRunLogs([]);
    setLogAverage([]);
    setSnapshotAverage([]);
    setError(null);
  }, []);

  return {
    // 상태
    buildLogs,
    runLogs,
    logAverage,
    snapshotAverage,
    loading,
    error,
    logFilters,
    
    // 계산된 값
    filteredLogs,
    logStatistics: getLogStatistics,
    
    // 액션 (실제 API가 구현되면 활성화)
    loadBuildLogs,
    loadRunLogs,
    loadLogAverage,
    loadSnapshotAverage,
    loadAllLogData,
    refreshLogs,
    clearLogs,
    
    // 모니터링 데이터 기반 로그 로딩
    loadLogDataFromMonitoring,
    
    // 필터
    toggleLogFilter,
    toggleAllFilters,
    searchLogs,
    getUserLogs,
    getLogsByType
  };
}; 