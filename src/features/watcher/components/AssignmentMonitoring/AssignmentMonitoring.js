import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography
} from '@mui/material';
import AssignmentMonitoringHeader from './AssignmentMonitoringHeader';
import MonitoringControls from './MonitoringControls';
import LogFilters from './LogFilters';
import LogDialog from './LogDialog';
import ChartsSection from './ChartsSection';
import {
  calculateIntervalValue,
  fetchMonitoringData,
  processChartData,
  fetchStudentInfo,
  fetchAssignmentInfo,
  fetchCourseInfo,
  fetchUserById
} from '../charts/ChartDataService';
import api from '../../../../api/axios';
import { useAuth } from '../../../../contexts/AuthContext';
import CacheManager from '../../../../utils/cache-manager';
import { LoadingSpinner } from '../../../../components/ui';



const AssignmentMonitoring = () => {
  const { courseId, assignmentId, userId } = useParams();
  const { user: authUser } = useAuth(); // useAuth에서 현재 인증된 사용자 정보 가져오기
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [data, setData] = useState(null);
  const [timeUnit, setTimeUnit] = useState('minute');
  const [minuteValue, setMinuteValue] = useState('5');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 실시간 업데이트 관련 상태
  const [liveUpdate, setLiveUpdate] = useState(false);
  const [liveUpdateStatus, setLiveUpdateStatus] = useState('idle'); // 'idle', 'updating', 'waiting'
  const liveUpdateIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);
  const countdownRef = useRef(null);
  const [nextUpdateTime, setNextUpdateTime] = useState(60);

  // 로그 데이터 관련 상태 추가
  const [runLogs, setRunLogs] = useState([]);
  const [buildLogs, setBuildLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showRunLogs, setShowRunLogs] = useState(true);
  const [showBuildLogs, setShowBuildLogs] = useState(true);
  const [showSuccessLogs, setShowSuccessLogs] = useState(true);
  const [showFailLogs, setShowFailLogs] = useState(true);

  // timeUnits 정의
  const timeUnits = {
    minute: '분',
    hour: '시간',
    day: '일',
    week: '주',
    month: '월'
  };

  // 카운트다운 업데이트 함수 - 완전히 새로 작성
  const updateCountdown = () => {
    if (!liveUpdate) return;
    
    const now = new Date();
    const lastUpdate = lastUpdateTimeRef.current || now;
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
    // 30초 주기로 변경
    const remainingSeconds = Math.max(0, 30 - elapsedSeconds);
    
    // DOM 요소를 직접 업데이트하여 리렌더링 최소화
    const countdownElement = document.getElementById('countdown-timer');
    if (countdownElement) {
      countdownElement.textContent = `${remainingSeconds}초 후 갱신`;
      
      // 원형 프로그레스 업데이트 (MUI CircularProgress는 직접 DOM 업데이트가 어려움)
      // 따라서 30초에 한번씩만 차트가 리렌더링되도록 값을 업데이트
      if (remainingSeconds > 0) {
        // 로그만 출력하고 상태는 업데이트하지 않음
      } else {
        // 0초일 때만 상태 업데이트하여 리렌더링 발생
        setNextUpdateTime(0);
      }
    } else {
      // 초기 렌더링이나 DOM 요소를 찾을 수 없을 때는 상태 업데이트
      setNextUpdateTime(remainingSeconds);
    }
  };

  // 타이머 ref 변수 추가
  const timerRef = useRef(30);

  // 실시간 업데이트 타이머 설정
  useEffect(() => {
    // 타이머 정리
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    // 타이머 시작 (liveUpdate가 true일 때만)
    if (liveUpdate) {
      timerRef.current = 30;
      setNextUpdateTime(30);
      
      // 카운트다운 업데이트를 위한 타이머
      countdownRef.current = setInterval(() => {
        // 카운트다운 로직
        timerRef.current -= 1;
        updateCountdown();
        
        // 30초마다 데이터 새로고침
        const now = new Date();
        const lastUpdate = lastUpdateTimeRef.current || now;
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
        
        if (elapsedSeconds >= 30) {
          handleDataRefresh(true);
        }
      }, 1000);
    }
    
    return () => {
      // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 정리
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [liveUpdate]);

  // 실시간 업데이트 토글 함수 - 완전히 새로 작성
  const toggleLiveUpdate = () => {
    const newLiveUpdate = !liveUpdate;
    
    if (newLiveUpdate) {
      // 실시간 업데이트 활성화
      setLiveUpdateStatus('updating');
      
      // 초기 타이머 값 설정
      timerRef.current = 30;
      setNextUpdateTime(30);
      
      // 즉시 데이터 새로고침
      handleDataRefresh(true).then(() => {
        // 데이터 로드 후 현재 시간을 기준으로 설정
        lastUpdateTimeRef.current = new Date();
      });
    } else {
      // 실시간 업데이트 비활성화
      setLiveUpdateStatus('idle');
    }
    
    // 상태 업데이트 (useEffect 트리거용)
    setLiveUpdate(newLiveUpdate);
  };

  // 실행 로그 가져오기 함수
  const fetchRunLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        course: courseId,
        assignment: assignmentId,
        user: userId
      });
      
      const response = await api.get(`/api/watcher/logs/run?${params}`);
      
      // 타임스탬프를 Date 객체로 변환하여 정렬
      const logs = response.data.run_logs ? response.data.run_logs.map(log => ({
        ...log,
        type: 'run',
        timestamp: new Date(log.timestamp).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp) : [];
      
      setRunLogs(logs);
      // console.log('실행 로그 로드 완료:', logs);
    } catch (error) {
      //console.error('실행 로그를 불러오는데 실패했습니다:', error);
      setRunLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // 빌드 로그 가져오기 함수
  const fetchBuildLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        course: courseId,
        assignment: assignmentId,
        user: userId
      });
      
      const response = await api.get(`/api/watcher/logs/build?${params}`);
      
      // 타임스탬프를 Date 객체로 변환하여 정렬
      const logs = response.data.build_logs ? response.data.build_logs.map(log => ({
        ...log,
        type: 'build',
        timestamp: new Date(log.timestamp).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp) : [];
      
      setBuildLogs(logs);
      //console.log('빌드 로그 로드 완료:', logs);
    } catch (error) {
      //console.error('빌드 로그를 불러오는데 실패했습니다:', error);
      setBuildLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // 로그 토글 핸들러
  const handleToggleRunLogs = () => {
    setShowRunLogs(!showRunLogs);
  };

  const handleToggleBuildLogs = () => {
    setShowBuildLogs(!showBuildLogs);
  };

  const handleToggleSuccessLogs = () => {
    setShowSuccessLogs(!showSuccessLogs);
  };

  const handleToggleFailLogs = () => {
    setShowFailLogs(!showFailLogs);
  };

  // 로그 클릭 핸들러
  const handleLogClick = (log) => {
    setSelectedLog(log);
    setLogDialogOpen(true);
  };

  // 로그 다이얼로그 닫기
  const handleCloseLogDialog = () => {
    setLogDialogOpen(false);
    setSelectedLog(null);
  };

  // 필터링된 로그 데이터 계산
  const getFilteredLogs = () => {
    const filteredRunLogs = showRunLogs ? runLogs.filter(log => 
      (log.exit_code === 0 && showSuccessLogs) || 
      (log.exit_code !== 0 && showFailLogs)
    ) : [];
    
    const filteredBuildLogs = showBuildLogs ? buildLogs.filter(log => 
      (log.exit_code === 0 && showSuccessLogs) || 
      (log.exit_code !== 0 && showFailLogs)
    ) : [];
    
    return { runLogs: filteredRunLogs, buildLogs: filteredBuildLogs };
  };

  // 데이터 새로고침 함수
  const handleDataRefresh = async (isLiveUpdate = false) => {
    if (!isLiveUpdate) setIsRefreshing(true);
    if (isLiveUpdate) setLiveUpdateStatus('updating');
    
    try {
      // 항상 API 호출하여 최신 데이터 가져오기
      const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
      
      // API 호출하여 데이터 가져오기
      const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
      
      const processedData = processChartData(response, assignment);
      
      setData(processedData);
      const now = new Date();
      setLastUpdated(now);
      
      // 로그 데이터 가져오기
      await Promise.all([
        fetchRunLogs(),
        fetchBuildLogs()
      ]);
      
      if (isLiveUpdate) {
        lastUpdateTimeRef.current = now;
        setLiveUpdateStatus('waiting');
      }
    } catch (error) {
      // 오류 발생 시에도 UI를 보여주기 위해 빈 데이터로 설정
      setData({
        timeData: [],
        timestamps: [],
        totalBytes: [],
        changeBytes: [],
        formattedTimes: [],
        additions: [],
        deletions: []
      });
      
      if (isLiveUpdate) {
        setLiveUpdateStatus('waiting');
      }
    } finally {
      if (!isLiveUpdate) setIsRefreshing(false);
    }
  };

  // 시간 단위 변경 핸들러
  const handleTimeUnitChange = (event) => {
    setTimeUnit(event.target.value);
  };

  // 분 단위 변경 핸들러
  const handleMinuteChange = (event) => {
    setMinuteValue(event.target.value);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      const startTime = performance.now();
      setLoading(true);
      
      try {
        // 모든 API 요청을 병렬로 실행
        const apiStartTime = performance.now();
        
        // 모든 데이터를 병렬로 가져오기
        const [assignmentData, courseData, monitoringData, runLogsData, buildLogsData] = await Promise.all([
          // 과제 정보 가져오기
          fetchAssignmentInfo(courseId, assignmentId).catch(err => {
            return null;
          }),
          
          // 강의 정보 가져오기
          fetchCourseInfo(courseId).catch(err => {
            return null;
          }),
          
          // 모니터링 데이터 가져오기 - 항상 API에서 데이터 요청
          fetchMonitoringData(
            calculateIntervalValue(timeUnit, minuteValue), 
            courseId, 
            assignmentId, 
            userId
          ).catch(err => {
            return { trends: [] };
          }),
          
          // 로그 데이터 가져오기 (실행 로그)
          fetchRunLogs().catch(() => []),
          
          // 로그 데이터 가져오기 (빌드 로그)
          fetchBuildLogs().catch(() => [])
        ]);
        
        // 학생 정보 가져오기 (사용자 정보에 따라 달라질 수 있어 별도 처리)
        let studentData = null;
        
        if (userId) {
          try {
            if (authUser?.role === 'STUDENT') {
              // 학생인 경우 자신의 정보를 가져옴
              const meResponse = await api.get('/api/users/me');
              studentData = meResponse.data;
            } else {
              // 교수/조교인 경우 해당 학생의 정보를 가져옴
              try {
                // 먼저 직접 API로 사용자 정보 조회 시도
                studentData = await fetchUserById(userId);
                
                // 정보가 불완전하면 기존 방식으로 시도
                if (!studentData || !studentData.name || studentData.name === '정보 없음') {
                  const fallbackData = await fetchStudentInfo(courseId, userId);
                  
                  // 배열인 경우 적절한 학생 정보 찾기
                  if (Array.isArray(fallbackData)) {
                    const targetStudent = fallbackData.find(s => 
                      String(s.userId) === String(userId) || 
                      String(s.id) === String(userId)
                    );
                    
                    if (targetStudent) {
                      studentData = targetStudent;
                    } else {
                      studentData = fallbackData;
                    }
                  } else {
                    studentData = fallbackData;
                  }
                }
              } catch (error) {
                studentData = {
                  id: userId,
                  userId: parseInt(userId),
                  studentId: '정보 없음',
                  studentNum: '정보 없음',
                  name: '정보 없음',
                  email: '정보 없음'
                };
              }
            }
          } catch (userError) {
          }
        }
        
        // 상태 업데이트
        if (assignmentData) setAssignment(assignmentData);
        if (courseData) setCourse(courseData);
        if (studentData) setStudent(studentData);
        
        // 모니터링 데이터 처리 및 설정
        const processedData = processChartData(monitoringData, assignmentData);
        setData(processedData);
        
        // 마지막 업데이트 시간 설정
        const now = new Date();
        setLastUpdated(now);
        lastUpdateTimeRef.current = now;
      } catch (error) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [courseId, assignmentId, userId, authUser]);

  // 데이터 변경에 따른 차트 업데이트 (timeUnit, minuteValue 변경시)
  useEffect(() => {
    if (!loading && courseId && assignmentId && userId) {
      const fetchUpdatedData = async () => {
        try {
          const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
          const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
          const processedData = processChartData(response, assignment);
          
          setData(processedData);
          const now = new Date();
          setLastUpdated(now);
          lastUpdateTimeRef.current = now;
        } catch (error) {
          //console.error('데이터 업데이트 오류:', error);
          // 오류 발생 시에도 UI 유지를 위해 기존 데이터 유지
        }
      };
      
      fetchUpdatedData();
    }
  }, [timeUnit, minuteValue]);



  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  // 필터링된 로그 데이터 가져오기
  const filteredLogs = getFilteredLogs();

  return (
    <Container maxWidth={false} sx={{ mt: 2, px: 2 }}>
      <Paper elevation={0} sx={{ 
        p: 3,
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
        borderRadius: '16px'
      }}>
        <AssignmentMonitoringHeader 
          course={course}
          assignment={assignment}
          student={student}
          assignmentId={assignmentId}
          userId={userId}
        />

        <MonitoringControls 
          timeUnit={timeUnit}
          onTimeUnitChange={handleTimeUnitChange}
          minuteValue={minuteValue}
          onMinuteChange={handleMinuteChange}
          onDataRefresh={handleDataRefresh}
          isRefreshing={isRefreshing}
          timeUnits={timeUnits}
          liveUpdate={liveUpdate}
          onToggleLiveUpdate={toggleLiveUpdate}
          nextUpdateTime={nextUpdateTime}
          lastUpdated={lastUpdated}
        />

        <LogFilters 
          showRunLogs={showRunLogs}
          onToggleRunLogs={handleToggleRunLogs}
          showBuildLogs={showBuildLogs}
          onToggleBuildLogs={handleToggleBuildLogs}
          showSuccessLogs={showSuccessLogs}
          onToggleSuccessLogs={handleToggleSuccessLogs}
          showFailLogs={showFailLogs}
          onToggleFailLogs={handleToggleFailLogs}
        />

        <ChartsSection 
          data={data}
          student={student}
          assignment={assignment}
          filteredLogs={filteredLogs}
        />
      </Paper>
      
      <LogDialog 
        open={logDialogOpen}
        onClose={handleCloseLogDialog}
        selectedLog={selectedLog}
      />
    </Container>
  );
};

export default AssignmentMonitoring;