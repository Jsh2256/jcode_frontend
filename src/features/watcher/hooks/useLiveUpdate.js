import { useState, useEffect, useCallback, useRef } from 'react';

export const useLiveUpdate = (updateFunction, intervalMs = 5000, autoStart = false) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // 실시간 업데이트 시작
  const startLiveUpdate = useCallback(() => {
    if (isActive || !updateFunction) return;

    setIsActive(true);
    setError(null);
    
    // 즉시 한 번 업데이트 실행
    if (updateFunction) {
      updateFunction();
    }
    
    intervalRef.current = setInterval(async () => {
      if (isUpdatingRef.current) {
        console.log('이전 업데이트가 아직 진행 중입니다. 스킵합니다.');
        return;
      }

      try {
        isUpdatingRef.current = true;
        setError(null);
        
        if (updateFunction) {
          await updateFunction();
        }
        
        setLastUpdateTime(new Date());
        setUpdateCount(prev => prev + 1);
      } catch (err) {
        console.error('실시간 업데이트 오류:', err);
        setError(err.message || '업데이트 중 오류가 발생했습니다.');
      } finally {
        isUpdatingRef.current = false;
      }
    }, intervalMs);
  }, [isActive, updateFunction, intervalMs]);

  // 실시간 업데이트 중지
  const stopLiveUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    isUpdatingRef.current = false;
  }, []);

  // 실시간 업데이트 토글
  const toggleLiveUpdate = useCallback(() => {
    if (isActive) {
      stopLiveUpdate();
    } else {
      startLiveUpdate();
    }
  }, [isActive, startLiveUpdate, stopLiveUpdate]);

  // 수동 업데이트 (즉시 실행)
  const manualUpdate = useCallback(async () => {
    if (isUpdatingRef.current || !updateFunction) return;

    try {
      isUpdatingRef.current = true;
      setError(null);
      
      await updateFunction();
      
      setLastUpdateTime(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (err) {
      console.error('수동 업데이트 오류:', err);
      setError(err.message || '업데이트 중 오류가 발생했습니다.');
    } finally {
      isUpdatingRef.current = false;
    }
  }, [updateFunction]);

  // 업데이트 간격 변경
  const changeInterval = useCallback((newInterval) => {
    const wasActive = isActive;
    
    if (wasActive) {
      stopLiveUpdate();
    }
    
    // 새로운 간격으로 다시 시작
    setTimeout(() => {
      if (wasActive) {
        startLiveUpdate();
      }
    }, 100);
  }, [isActive, stopLiveUpdate, startLiveUpdate]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 업데이트 함수가 변경되면 재시작
  useEffect(() => {
    if (isActive && updateFunction) {
      stopLiveUpdate();
      startLiveUpdate();
    }
  }, [updateFunction]);

  // 자동 시작 옵션
  useEffect(() => {
    if (autoStart && updateFunction && !isActive) {
      startLiveUpdate();
    }
  }, [autoStart, updateFunction, isActive, startLiveUpdate]);

  // 시간 포맷 유틸리티
  const formatLastUpdateTime = () => {
    if (!lastUpdateTime) return '업데이트 기록 없음';
    
    const now = new Date();
    const diff = Math.floor((now - lastUpdateTime) / 1000);
    
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    
    return lastUpdateTime.toLocaleString();
  };

  // 다음 업데이트까지 남은 시간 계산
  const getTimeUntilNextUpdate = () => {
    if (!isActive || !lastUpdateTime) return 0;
    
    const timeSinceLastUpdate = Date.now() - lastUpdateTime.getTime();
    const remainingTime = Math.max(0, intervalMs - timeSinceLastUpdate);
    
    return Math.ceil(remainingTime / 1000);
  };

  // 업데이트 상태 정보
  const getUpdateStatus = () => {
    return {
      isActive,
      isUpdating: isUpdatingRef.current,
      updateCount,
      lastUpdateTime,
      formattedLastUpdate: formatLastUpdateTime(),
      timeUntilNext: getTimeUntilNextUpdate(),
      intervalSeconds: Math.floor(intervalMs / 1000),
      hasError: !!error
    };
  };

  return {
    // 상태
    isActive,
    lastUpdateTime,
    updateCount,
    error,
    isUpdating: isUpdatingRef.current,
    
    // 계산된 값
    formattedLastUpdate: formatLastUpdateTime(),
    timeUntilNext: getTimeUntilNextUpdate(),
    updateStatus: getUpdateStatus(),
    
    // 액션
    startLiveUpdate,
    stopLiveUpdate,
    toggleLiveUpdate,
    manualUpdate,
    changeInterval
  };
}; 