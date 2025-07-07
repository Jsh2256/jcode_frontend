import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Tabs,
  Tab,
  Fade,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonitorIcon from '@mui/icons-material/Monitor';
import PeopleIcon from '@mui/icons-material/People';
import SortIcon from '@mui/icons-material/Sort';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import NumbersIcon from '@mui/icons-material/Numbers';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CodeIcon from '@mui/icons-material/Code';
import { toast } from 'react-toastify';
import ErrorIcon from '@mui/icons-material/Error';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import StudentChart from './charts/StudentChart';
import DateRangeSelector from './charts/DateRangeSelector';
import StudentSelector from './charts/StudentSelector';
import ChartHeader from './charts/ChartHeader';
import api from '../../api/axios';
import { 
  fetchAssignmentInfo, 
  fetchCourseInfo, 
  fetchStudents, 
  fetchChartDataByTimeRange,
  redirectToJCode,
  fetchUserCoursesDetails,
  fetchMonitoringData
} from './charts/api';
import { sortByName, sortByStudentNum, sortByChanges, createStringSort } from '../../utils/sortHelpers';

// TabPanel 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={300}>
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

const AssignmentDetail = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 상태 변수들
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState([]);
  const [chartError, setChartError] = useState('');

  // 날짜 관련 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [rangeEndDate, setRangeEndDate] = useState(null);
  const [currentRange, setCurrentRange] = useState([0, 100]);

  // 학생 선택 관련 상태
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  // 정렬 상태 추가 
  const [sort, setSort] = useState({
    field: 'name',
    order: 'asc'
  });

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        //console.log('데이터 로드 시작', { courseId, assignmentId, userRole: user?.role });
        
        // 과제 정보 가져오기
        if (user?.role === 'ADMIN') {
          try {
            const courseData = await fetchCourseInfo(courseId);
            //console.log('Admin - 강의 정보 로드 성공:', courseData);
            setCourse(courseData);
          } catch (courseError) {
            //console.error('Admin - 강의 정보 로드 실패:', courseError);
          }

          try {
            const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
            //console.log('Admin - 과제 정보 로드 성공:', assignmentData);
            
            // assignmentData가 배열인지 확인
            if (Array.isArray(assignmentData)) {
              const currentAssignment = assignmentData.find(a => a.assignmentId === parseInt(assignmentId));
              if (!currentAssignment) {
                //console.error('과제를 찾을 수 없습니다:', { assignmentId, assignmentData });
                throw new Error('과제를 찾을 수 없습니다.');
              }
              setAssignment(currentAssignment);
            } else {
              // assignmentData가 배열이 아닌 경우 직접 사용
              //console.log('과제 정보가 객체로 반환됨, 직접 사용');
              setAssignment(assignmentData);
            }
          } catch (assignmentError) {
            //console.error('Admin - 과제 정보 로드 실패:', assignmentError);
          }

          // 여기서 학생 목록을 가져옵니다
          try {
            //console.log('Admin - 학생 목록 로드 시작');
            const studentsData = await fetchStudents(courseId);
            //console.log('Admin - 학생 목록 로드 성공:', studentsData);
            setSubmissions(studentsData || []);
          } catch (studentsError) {
            //console.error('Admin - 학생 목록 로드 실패:', studentsError);
            setSubmissions([]);
          }
        }
        else if (user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') {
          //console.log('교수/조교 - 사용자 강의 정보 로드 시작');
          const courseData = await fetchUserCoursesDetails();
          //console.log('교수/조교 - 사용자 강의 정보 로드 성공:', courseData);
          const foundCourse = courseData.find(c => c.courseId === parseInt(courseId));

          if (!foundCourse) {
            //console.error('강의를 찾을 수 없습니다:', { courseId, courseData });
            throw new Error('강의를 찾을 수 없습니다.');
          }
          setCourse(foundCourse);

          //console.log('교수/조교 - 과제 정보 로드 시작');
          const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
          //console.log('교수/조교 - 과제 정보 로드 성공:', assignmentData);
          
          // assignmentData가 배열인지 확인
          if (Array.isArray(assignmentData)) {
            const currentAssignment = assignmentData.find(a => a.assignmentId === parseInt(assignmentId));
            if (!currentAssignment) {
              //console.error('과제를 찾을 수 없습니다:', { assignmentId, assignmentData });
              throw new Error('과제를 찾을 수 없습니다.');
            }
            setAssignment(currentAssignment);
          } else {
            // assignmentData가 배열이 아닌 경우 직접 사용
            //console.log('과제 정보가 객체로 반환됨, 직접 사용');
            setAssignment(assignmentData);
          }
          
          // 여기서 학생 목록을 가져옵니다
          //console.log('교수/조교 - 학생 목록 로드 시작');
          const studentsData = await fetchStudents(courseId);
          //console.log('교수/조교 - 학생 목록 로드 성공:', studentsData);
          setSubmissions(studentsData || []);
        } 
        else 
        {
          //console.log('학생 - 사용자 강의 정보 로드 시작');
          const courseData = await fetchUserCoursesDetails();
         // console.log('학생 - 사용자 강의 정보 로드 성공:', courseData);
          const foundCourse = courseData.find(c => c.courseId === parseInt(courseId));

          if (!foundCourse) {
            //console.error('강의를 찾을 수 없습니다:', { courseId, courseData });
            throw new Error('강의를 찾을 수 없습니다.');
          }
          setCourse(foundCourse);

          //console.log('학생 - 과제 정보 로드 시작');
          const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
          //console.log('학생 - 과제 정보 로드 성공:', assignmentData);
          
          // assignmentData가 배열인지 확인
          if (Array.isArray(assignmentData)) {
            const currentAssignment = assignmentData.find(a => a.assignmentId === parseInt(assignmentId));
            if (!currentAssignment) {
              //console.error('과제를 찾을 수 없습니다:', { assignmentId, assignmentData });
              throw new Error('과제를 찾을 수 없습니다.');
            }
            setAssignment(currentAssignment);
          } else {
            // assignmentData가 배열이 아닌 경우 직접 사용
            //console.log('과제 정보가 객체로 반환됨, 직접 사용');
            setAssignment(assignmentData);
          }

          setSubmissions([]);
        }
          
        // 초기 날짜 범위 설정
        //console.log('초기 날짜 범위 설정 시작');
        try {
          const assignmentDetails = await fetchAssignmentInfo(courseId, assignmentId);
          //console.log('날짜 설정용 과제 정보 로드 성공:', assignmentDetails);
          
          if (assignmentDetails) {
            let startDateTime, endDateTime;
            
            if (Array.isArray(assignmentDetails)) {
              // 배열인 경우 해당 과제 찾기
              const foundAssignment = assignmentDetails.find(a => a.assignmentId === parseInt(assignmentId));
              if (foundAssignment) {
                startDateTime = foundAssignment.startDateTime || foundAssignment.kickoffDate;
                endDateTime = foundAssignment.endDateTime || foundAssignment.deadlineDate;
              }
            } else {
              // 객체인 경우 직접 사용
              startDateTime = assignmentDetails.startDateTime || assignmentDetails.kickoffDate;
              endDateTime = assignmentDetails.endDateTime || assignmentDetails.deadlineDate;
            }
            
            if (startDateTime && endDateTime) {
              const kickoff = new Date(startDateTime);
              const deadline = new Date(endDateTime);
              //console.log('설정된 날짜 범위:', { kickoff, deadline });
              setStartDate(kickoff);
              setEndDate(deadline);
              setRangeStartDate(kickoff);
              setRangeEndDate(deadline);
            } else {
              //console.warn('과제의 시작일 또는 마감일이 설정되지 않았습니다');
            }
          }
        } catch (error) {
          //console.error('날짜 범위 설정 오류:', error);
        }
        
        setLoading(false);
        //console.log('데이터 로드 완료');
      } catch (err) {
        //console.error('데이터 로드 오류:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, user?.role]);

  // 차트 데이터 가져오기
  const fetchChartData = async () => {
    try {
      if (!rangeStartDate || !rangeEndDate) {
        //console.log('날짜 범위가 설정되지 않아 차트 데이터를 가져올 수 없습니다.');
        return;
      }
      
      //console.log('차트 데이터 요청 시작:', {
      //  courseId, 
      //  assignmentId,
      //  rangeStartDate: rangeStartDate.toString(),
      //  rangeEndDate: rangeEndDate.toString()
      //});
      
      const response = await fetchChartDataByTimeRange(
        courseId, 
        assignmentId,
        rangeStartDate,
        rangeEndDate
      );
      
      //console.log('차트 데이터 응답 결과:', response);

      // 학생 정보가 있는 경우 이름 필드 매핑
      if (response && response.length > 0 && submissions && submissions.length > 0) {
        //console.log('학생 정보와 차트 데이터 매핑 시작');
        //console.log('학생 목록 예시:', submissions[0]);
        
        // 학생 정보 매핑 - 학번 기준으로 매핑
        const enhancedData = response.map(item => {
          // 해당 학번의 학생 정보 찾기
          const studentInfo = submissions.find(s => 
            String(s.studentNum) === String(item.student_num)
          );
          
          if (studentInfo) {
            return {
              ...item,
              name: studentInfo.name || item.name, 
              email: studentInfo.email || item.email,
              user_id: studentInfo.userId || studentInfo.id || item.user_id,
              role: studentInfo.role, // 역할 정보 추가
              courseRole: studentInfo.courseRole // 과목 내 역할 정보 추가
            };
          }
          return null; // 학생 정보가 없는 경우 null 반환
        }).filter(item => item !== null); // null 값 제거
        
        // 교수/조교/관리자 필터링
        let filteredData;
        if (user?.role === 'STUDENT') {
          // 학생인 경우 교수/조교/관리자 제외
          filteredData = enhancedData.filter(item => {
            const userInfo = submissions.find(s => String(s.studentNum) === String(item.student_num));
            if (userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'ASSISTANT' || userInfo.role === 'PROFESSOR')) {
              return false;
            }
            return true;
          });
        } else {
          // 교수/관리자인 경우 학생만 표시
          filteredData = enhancedData.filter(item => {
            // 역할 정보 확인
            if (item.role === 'PROFESSOR' || item.role === 'ASSISTANT' || item.role === 'ADMIN' ||
                item.courseRole === 'PROFESSOR' || item.courseRole === 'ASSISTANT' || item.courseRole === 'ADMIN') {
              return false;
            }
            return true;
          });
        }
        
        //console.log('향상된 차트 데이터:', filteredData.length, '명');
        setChartData(filteredData);
      } else {
        // 학생 정보가 없는 경우 원본 데이터 사용
        //console.log('학생 정보 없음 또는 차트 데이터 없음 - 원본 데이터 사용');
        setChartData(response);
      }
      
      setChartError('');
    } catch (error) {
      //console.error('차트 데이터 로딩 오류:', error);
      setChartError('차트 데이터를 불러오는데 실패했습니다.');
      setChartData([]);
    }
  };

  // 초기 데이터 로드 후 차트 데이터 가져오기
  useEffect(() => {
    if (!loading && rangeStartDate && rangeEndDate && chartData.length === 0) {
      //console.log('초기 차트 데이터 로드 시작');
      fetchChartData();
    }
  }, [loading, rangeStartDate, rangeEndDate]);

  // 탭 변경 핸들러
  const handleTabChange = async (event, newValue) => {
    if (user?.role === 'STUDENT' && newValue === 1) {
      try {
        const startTime = performance.now();
        //console.log('[성능] 나의 통계 탭 선택 - 처리 시작');
        
        // 로그인한 사용자 정보 가져오기
        const userInfoStartTime = performance.now();
        //console.log('[성능] 사용자 정보 요청 시작');
        const meResponse = await api.get('/api/users/me');
        //console.log('[나의 통계] 사용자 정보 응답:', meResponse.data);
        const userInfoEndTime = performance.now();
        //console.log(`[성능] 사용자 정보 요청 완료: ${userInfoEndTime - userInfoStartTime}ms`);
        
        // 사용자 ID 가져오기
        const userId = meResponse.data.userId;
        //console.log('[나의 통계] 로그인 유저 ID:', userId);
        
        if (!userId) {
          //console.error('[나의 통계] 사용자 ID를 찾을 수 없습니다.');
          toast.error('사용자 정보를 불러올 수 없습니다.');
          return;
        }
        
        // 미리 모니터링 데이터 요청 시작 (메인 스레드를 차단하지 않도록 별도 처리)
        setTimeout(() => {
          try {
            //console.log('[나의 통계] 사전 데이터 로딩 시작');
            // const startTime = performance.now();
            const intervalValue = 5; // 기본 간격값 (5분)
            
            // 사용자 모니터링 데이터 미리 가져오기
            const cacheStartTime = performance.now();
            fetchMonitoringData(intervalValue, courseId, assignmentId, userId)
              .then(() => {
                const cacheEndTime = performance.now();
                //console.log(`[나의 통계] 모니터링 데이터 사전 로딩 완료: ${cacheEndTime - cacheStartTime}ms 소요`);
              })
              // .catch(err => console.error('[나의 통계] 모니터링 데이터 미리 로드 실패:', err));
            
            // 기본 과제 정보 미리 가져오기
            const assignmentStartTime = performance.now();
            fetchAssignmentInfo(courseId, assignmentId)
              .then(() => {
                const assignmentEndTime = performance.now();
                //console.log(`[나의 통계] 과제 정보 사전 로딩 완료: ${assignmentEndTime - assignmentStartTime}ms 소요`);
                //console.log(`[성능] 사전 로딩 전체 완료: ${performance.now() - startTime}ms 소요`);
              })
              // .catch(err => console.error('[나의 통계] 과제 정보 미리 로드 실패:', err));
          } catch (err) {
            //console.error('[나의 통계] 사전 데이터 로드 오류:', err);
          }
        }, 0);
        
        //console.log('[나의 통계] 페이지 이동 시작');
        //const navigateStartTime = performance.now();
        
        // 학생의 통계 페이지로 이동
        navigate(`/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${userId}`);
        
        //const endTime = performance.now();
        //console.log(`[성능] 나의 통계 탭 처리 완료: ${endTime - startTime}ms`);
        //console.log('[성능 요약-탭 전환]', {
        //  '전체 처리 시간': endTime - startTime,
        //  '사용자 정보 요청 시간': userInfoEndTime - userInfoStartTime,
        //  '페이지 이동 시간': endTime - navigateStartTime
        //});
      } catch (error) {
        //console.error('[나의 통계] 사용자 정보 로드 오류:', error);
        toast.error('사용자 정보를 불러오는데 실패했습니다.');
      }
      return;
    }
    
    setTabValue(newValue);
  };

  // 슬라이더 변경 핸들러
  const handleRangeChange = (event, newValue) => {
    setCurrentRange(newValue);
    if (startDate && endDate) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startMillis = totalMillis * (newValue[0] / 100);
      const endMillis = totalMillis * (newValue[1] / 100);
      
      const newRangeStartDate = new Date(startDate.getTime() + startMillis);
      const newRangeEndDate = new Date(startDate.getTime() + endMillis);
      
      setRangeStartDate(newRangeStartDate);
      setRangeEndDate(newRangeEndDate);
    }
  };

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (newDate) => {
    if (newDate && endDate && newDate < endDate) {
      setRangeStartDate(newDate);
      updateSliderFromDates(newDate, rangeEndDate);
    }
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (newDate) => {
    if (newDate && startDate && newDate > rangeStartDate) {
      setRangeEndDate(newDate);
      updateSliderFromDates(rangeStartDate, newDate);
    }
  };

  // 날짜에서 슬라이더 값 계산
  const updateSliderFromDates = (start, end) => {
    if (startDate && endDate && start && end) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startPosition = ((start.getTime() - startDate.getTime()) / totalMillis) * 100;
      const endPosition = ((end.getTime() - startDate.getTime()) / totalMillis) * 100;
      setCurrentRange([startPosition, endPosition]);
    }
  };

  // 정렬 핸들러
  const handleSortByName = () => {
    const sorted = sortByName(chartData);
    setChartData(sorted);
  };

  const handleSortByChanges = () => {
    const sorted = sortByChanges(chartData);
    setChartData(sorted);
  };

  const handleSortByStudentNum = () => {
    const sorted = sortByStudentNum(chartData);
    setChartData(sorted);
  };

  // 다이얼로그 핸들러
  const handleCloseDialog = () => {
    //.log('다이얼로그 닫기');
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  // 정렬 토글 함수
  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // 필터링 및 정렬 함수
  const getFilteredAndSortedStudents = () => {
    // 학생만 필터링 (교수/조교/관리자 제외)
    const filtered = submissions.filter(submission => {
      // role 확인
      if (submission.role === 'PROFESSOR' || submission.role === 'ASSISTANT' || submission.role === 'ADMIN' || 
          submission.courseRole === 'PROFESSOR' || submission.courseRole === 'ASSISTANT' || submission.courseRole === 'ADMIN') {
        return false;
      }
      
      // 검색어 필터링
      const searchLower = searchQuery.toLowerCase();
      return (
        (submission.email && submission.email.toLowerCase().includes(searchLower)) ||
        (submission.name && submission.name.toLowerCase().includes(searchLower)) ||
        (submission.studentNum && String(submission.studentNum).toLowerCase().includes(searchLower))
      );
    });
    
    // 정렬
    const fieldMapping = {
      'name': 'name',
      'email': 'email',
      'studentNum': 'studentNum'
    };
    
    const fieldToSort = fieldMapping[sort.field] || 'name';
    const sortFunction = createStringSort(fieldToSort, sort.order === 'asc');
    
    return filtered.sort(sortFunction);
  };

  // JCode 리다이렉션 핸들러 수정
  const handleJCodeRedirect = async (student) => {
    try {
      if (!student || !student.email) {
        //console.error('학생 이메일 정보가 없어 JCode로 이동할 수 없습니다.');
        toast.error('학생 정보가 불완전합니다. 이메일이 필요합니다.');
        return;
      }

      const finalUrl = await redirectToJCode(student.email, courseId);
      
      if (!finalUrl) {
        throw new Error("리다이렉트 URL을 찾을 수 없습니다");
      }
      
      window.open(finalUrl, '_blank');
    } catch (err) {
      //console.error('JCode 리다이렉트 오류:', err);
      toast.error('Web-IDE 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', {
        icon: ({theme, type}) => <ErrorIcon sx={{ color: '#fff', fontSize: '1.5rem', mr: 1 }}/>,
        style: {
          background: isDarkMode ? '#d32f2f' : '#f44336',
          color: '#fff',
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
          borderRadius: '8px',
          fontSize: '0.95rem',
          padding: '12px 20px'
        }
      });
    }
  };

  // Watcher 리다이렉션 핸들러
  const handleWatcherRedirect = (student) => {
    navigate(`/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${student.userId}`);
    handleCloseDialog();
  };

  // 학생 차트 클릭 핸들러
  const handleStudentChartClick = (studentData) => {
    if (user?.role === 'STUDENT') return;
    
    //console.log('AssignmentDetail에서 받은 학생 데이터:', studentData);
    //console.log('현재 다이얼로그 상태:', { openDialog, selectedStudent });
    
    // 학생 정보가 직접 전달된 경우
    if (studentData && studentData.studentNum) {
      const studentInfo = {
        userId: studentData.userId,
        studentNum: studentData.studentNum,
        name: studentData.name,
        email: studentData.email
      };
      
      //console.log('다이얼로그에 표시할 학생 정보:', studentInfo);
      
      // 다이얼로그 표시 상태 업데이트
      // 상태 업데이트를 위해 setTimeout 사용
      setTimeout(() => {
        setSelectedStudent(studentInfo);
        setOpenDialog(true);
        //console.log('다이얼로그 상태 업데이트됨:', true);
      }, 0);
      return;
    }
    
    // studentNum만 있는 경우 (기존 로직)
    const studentInfo = submissions.find(s => 
      String(s.studentNum) === String(studentData.studentNum || studentData.student_num)
    );
    
    if (studentInfo) {
      //console.log('submissions에서 찾은 학생 정보:', studentInfo);
      
      // 다이얼로그 표시 상태 업데이트
      setTimeout(() => {
        setSelectedStudent(studentInfo);
        setOpenDialog(true);
        //console.log('다이얼로그 상태 업데이트됨:', true);
      }, 0);
    } else {
      //console.error('학생 정보를 찾을 수 없습니다:', studentData);
      
      // 최소한의 정보라도 표시
      setTimeout(() => {
        setSelectedStudent({
          userId: studentData.userId || studentData.user_id || studentData.id || '',
          studentNum: studentData.studentNum || studentData.student_num || '',
          name: studentData.name || '이름 없음',
          email: studentData.email || ''
        });
        setOpenDialog(true);
        //console.log('최소 정보로 다이얼로그 상태 업데이트됨:', true);
      }, 0);
    }
  };

  // 학생 목록 필터링 후 카운트 업데이트
  useEffect(() => {
    if (submissions.length > 0) {
      const filteredStudents = getFilteredAndSortedStudents();
      setStudentCount(filteredStudents.length);
    } else {
      setStudentCount(0);
    }
  }, [submissions, searchQuery, sort]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
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

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth={false} sx={{ mt: 2, px: 2 }}>
        <Paper elevation={0} sx={{ 
          p: 3,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
          borderRadius: '16px'
        }}>
          <WatcherBreadcrumbs 
            paths={[
              { 
                text: course?.courseName || '로딩중...', 
                to: `/watcher/class/${course?.courseId}` 
              },
              { 
                text: assignment?.assignmentName || '로딩중...', 
                to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}` 
              }
            ]} 
          />

          <ChartHeader
            student={null}
            assignment={assignment}
            course={course}
          />

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    textTransform: 'none',
                    minHeight: '48px'
                  }
                }}
              >
                <Tab 
                  icon={<BarChartIcon />} 
                  iconPosition="start" 
                  label="전체 통계" 
                />
                {user?.role === 'STUDENT' && (
                  <Tab 
                    icon={<MonitorIcon />} 
                    iconPosition="start" 
                    label="나의 통계" 
                  />
                )}
                {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') && (
                  <Tab 
                    icon={<PeopleIcon />} 
                    iconPosition="start" 
                    label={`학생 목록 (${studentCount})`} 
                  />
                )}
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                {/* 검색 필드 - 학생이 아닌 경우에만 표시 */}
                {user?.role !== 'STUDENT' && (
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="이름 또는 학번으로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                      mb: 3,
                      '& .MuiInputBase-root': {
                        borderRadius: '20px',
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.875rem'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                
                {/* 정렬 버튼 */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={handleSortByName}
                    startIcon={<SortIcon sx={{ fontSize: '1rem' }} />}
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      px: 1.5
                    }}
                  >
                    이름순
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={handleSortByChanges}
                    startIcon={<BarChartIcon sx={{ fontSize: '1rem' }} />}
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      px: 1.5
                    }}
                  >
                    변화량순
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={handleSortByStudentNum}
                    startIcon={<NumbersIcon sx={{ fontSize: '1rem' }} />}
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      px: 1.5
                    }}
                  >
                    학번순
                  </Button>
                </Box>
                
                {/* 학생 차트 */}
                <StudentChart 
                  data={chartData}
                  searchQuery={searchQuery}
                  userRole={user?.role}
                  onStudentClick={handleStudentChartClick}
                />
                
                {/* 날짜 범위 선택기 */}
                <DateRangeSelector 
                  startDate={startDate}
                  endDate={endDate}
                  rangeStartDate={rangeStartDate}
                  rangeEndDate={rangeEndDate}
                  currentRange={currentRange}
                  onRangeChange={handleRangeChange}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={handleEndDateChange}
                  onFetchData={fetchChartData}
                />
              </Box>
            </TabPanel>
            
            {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') && (
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="이메일, 이름, 학번으로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                      mt: 2,
                      '& .MuiInputBase-root': {
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '50px', fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          No.
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          학번
                          <IconButton size="small" onClick={() => toggleSort('studentNum')} sx={{ ml: 1 }}>
                            <Box sx={{ 
                              transform: sort.field !== 'studentNum' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                              transition: 'transform 0.2s ease-in-out',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <KeyboardArrowDownIcon fontSize="small" />
                            </Box>
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          이름
                          <IconButton size="small" onClick={() => toggleSort('name')} sx={{ ml: 1 }}>
                            <Box sx={{ 
                              transform: sort.field !== 'name' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                              transition: 'transform 0.2s ease-in-out',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <KeyboardArrowDownIcon fontSize="small" />
                            </Box>
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          이메일
                          <IconButton size="small" onClick={() => toggleSort('email')} sx={{ ml: 1 }}>
                            <Box sx={{ 
                              transform: sort.field !== 'email' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                              transition: 'transform 0.2s ease-in-out',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <KeyboardArrowDownIcon fontSize="small" />
                            </Box>
                          </IconButton>
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          작업
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredAndSortedStudents().map((student, index) => (
                        <TableRow key={student.userId || student.id || index}>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {index + 1}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {student.studentNum || '정보 없음'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {student.name || '정보 없음'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {student.email || '정보 없음'}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                                onClick={() => handleJCodeRedirect(student)}
                                sx={{ 
                                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5,
                                  minHeight: '28px',
                                  borderRadius: '14px',
                                  textTransform: 'none'
                                }}
                              >
                                JCode
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<MonitorIcon sx={{ fontSize: '1rem' }} />}
                                onClick={() => handleWatcherRedirect(student)}
                                sx={{ 
                                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5,
                                  minHeight: '28px',
                                  borderRadius: '14px',
                                  textTransform: 'none'
                                }}
                              >
                                Watcher
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredAndSortedStudents().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="textSecondary">
                              검색 결과가 없거나 학생 목록을 불러오지 못했습니다.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            )}
          </Box>
        </Paper>

        {/* 학생 선택 다이얼로그 */}
        <StudentSelector
          open={openDialog}
          onClose={handleCloseDialog}
          student={selectedStudent}
          onJCodeRedirect={handleJCodeRedirect}
          onWatcherRedirect={handleWatcherRedirect}
        />
      </Container>
    </Fade>
  );
};

export default AssignmentDetail;



