import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  CircularProgress,
  Box,
  Button,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Fade,
  Grid,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../contexts/ThemeContext';
import RemainingTime from './RemainingTime';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import CodeIcon from '@mui/icons-material/Code';
import ErrorIcon from '@mui/icons-material/Error';
import { createStringSort } from '../../utils/sortHelpers';

const ClassDetail = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [sort, setSort] = useState({
    field: 'email',
    order: 'asc'
  });
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    assignmentName: '',
    assignmentDescription: '',
    kickoffDate: '',
    deadlineDate: ''
  });
  const [currentTab, setCurrentTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    // 학생인 경우 무조건 assignments 탭으로
    if (user?.role === 'STUDENT') {
      return 'assignments';
    }
    
    // URL에 tab이 없거나 학생이 아닌 경우 students를 기본값으로
    return tabFromUrl || 'students';
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [promotingStudent, setPromotingStudent] = useState(null);
  const [openPromoteDialog, setOpenPromoteDialog] = useState(false);
  const { isDarkMode } = useTheme();
  const [withdrawDialog, setWithdrawDialog] = useState({
    open: false,
    userId: null,
    userName: '',
    confirmText: ''
  });

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    // 학생인 경우 탭 변경 불가
    if (user?.role === 'STUDENT') {
      return;
    }
    
    setCurrentTab(newValue);
    // URL 업데이트
    const params = new URLSearchParams(location.search);
    params.set('tab', newValue);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const fetchData = useCallback(async () => {
    try {
      if (user?.role === 'ADMIN') {
        const coursesResponse = await api.get(`/api/courses/${courseId}/details`);
        setCourse(coursesResponse.data);
        setAssignments(coursesResponse.data.assignments || []);
        
        const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
        setStudents(studentsResponse.data);
      } else if (user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') {
        const coursesResponse = await api.get('/api/users/me/courses/details');
        const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
        if (!foundCourse) {
          throw new Error('강의를 찾을 수 없습니다.');
        }
        setCourse(foundCourse);
        setAssignments(foundCourse.assignments || []);
        
        const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
        setStudents(studentsResponse.data);
      } else {
        const coursesResponse = await api.get('/api/users/me/courses/details');
        const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
        if (!foundCourse) {
          throw new Error('강의를 찾을 수 없습니다.');
        }
        setCourse(foundCourse);
        setAssignments(foundCourse.assignments || []);
      }
      setLoading(false);
    } catch (error) {
      setError('데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getFilteredAndSortedStudents = () => {
    // 검색 조건에 맞는 사용자들만 필터링
    const filtered = students.filter(student => {
      const searchLower = searchQuery.toLowerCase();
      const emailMatch = student.email?.toLowerCase().includes(searchLower);
      const nameMatch = student.name?.toLowerCase().includes(searchLower);
      const studentNumMatch = String(student.studentNum || '').toLowerCase().includes(searchLower);
      return emailMatch || nameMatch || studentNumMatch;
    });

    // 정렬: 교수 > 조교 > 학생 > 관리자 순서로 정렬
    return filtered.sort((a, b) => {
      // 역할 우선순위 정의 (순서 변경)
      const roleOrder = {
        'PROFESSOR': 0,
        'ASSISTANT': 1,
        'STUDENT': 2,
        'ADMIN': 3
      };

      // 먼저 역할로 정렬
      if (roleOrder[a.courseRole] !== roleOrder[b.courseRole]) {
        return roleOrder[a.courseRole] - roleOrder[b.courseRole];
      }
      
      // 역할이 같은 경우 선택된 정렬 기준으로 정렬
      const fieldMapping = {
        'email': 'email',
        'name': 'name', 
        'studentNum': 'studentNum'
      };
      
      const fieldToSort = fieldMapping[sort.field] || 'email';
      const sortFunction = createStringSort(fieldToSort, sort.order === 'asc');
      
      return sortFunction(a, b);
    });
  };

  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // 과제 코드 중복 체크 함수 추가
  const isAssignmentCodeExists = (code) => {
    return assignments.some(assignment => assignment.assignmentName === code);
  };

  const handleAddAssignment = async () => {
    try {
      // 사용자 입력 시간을 Date 객체로 변환
      const kickoffDateInput = new Date(newAssignment.kickoffDate);
      const deadlineDateInput = new Date(newAssignment.deadlineDate);
      
      // 사용자가 입력한 시간을 그대로 ISO 문자열로 만들기
      // 예: '2023-08-15T18:00' → '2023-08-15T18:00:00.000Z'
      // 이렇게 하면 브라우저가 자동으로 UTC로 변환하는 것을 방지
      const kickoffDateISO = new Date(
        Date.UTC(
          kickoffDateInput.getFullYear(),
          kickoffDateInput.getMonth(),
          kickoffDateInput.getDate(),
          kickoffDateInput.getHours(),
          kickoffDateInput.getMinutes()
        )
      ).toISOString();
      
      const deadlineDateISO = new Date(
        Date.UTC(
          deadlineDateInput.getFullYear(),
          deadlineDateInput.getMonth(),
          deadlineDateInput.getDate(),
          deadlineDateInput.getHours(),
          deadlineDateInput.getMinutes()
        )
      ).toISOString();
      
      await api.post(`/api/courses/${course.courseId}/assignments`, {
        ...newAssignment,
        kickoffDate: kickoffDateISO,
        deadlineDate: deadlineDateISO
      });

      const assignmentsResponse = await api.get(`/api/courses/${course.courseId}/assignments`);
      setAssignments(assignmentsResponse.data);

      setOpenAssignmentDialog(false);
      setNewAssignment({
        assignmentName: '',
        assignmentDescription: '',
        kickoffDate: '',
        deadlineDate: ''
      });
    } catch (error) {
      setError('과제 추가에 실패했습니다.');
    }
  };

  const handleEditAssignment = async () => {
    try {
      // 사용자 입력 시간을 Date 객체로 변환
      const kickoffDateInput = new Date(editingAssignment.kickoffDate);
      const deadlineDateInput = new Date(editingAssignment.deadlineDate);
      
      // 사용자가 입력한 시간을 그대로 ISO 문자열로 만들기
      const kickoffDateISO = new Date(
        Date.UTC(
          kickoffDateInput.getFullYear(),
          kickoffDateInput.getMonth(),
          kickoffDateInput.getDate(),
          kickoffDateInput.getHours(),
          kickoffDateInput.getMinutes()
        )
      ).toISOString();
      
      const deadlineDateISO = new Date(
        Date.UTC(
          deadlineDateInput.getFullYear(),
          deadlineDateInput.getMonth(),
          deadlineDateInput.getDate(),
          deadlineDateInput.getHours(),
          deadlineDateInput.getMinutes()
        )
      ).toISOString();
      
      await api.put(`/api/courses/${courseId}/assignments/${editingAssignment.assignmentId}`, {
        assignmentName: editingAssignment.assignmentName,
        assignmentDescription: editingAssignment.assignmentDescription,
        kickoffDate: kickoffDateISO,
        deadlineDate: deadlineDateISO
      });

      const assignmentsResponse = await api.get(`/api/courses/${courseId}/assignments`);
      setAssignments(assignmentsResponse.data);

      setOpenEditDialog(false);
      setEditingAssignment(null);
      
      toast.success('과제가 성공적으로 수정되었습니다.');
    } catch (error) {
      toast.error('과제 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await api.delete(`/api/courses/${courseId}/assignments/${deletingAssignment.assignmentId}`);
      
      const assignmentsResponse = await api.get(`/api/courses/${courseId}/assignments`);
      setAssignments(assignmentsResponse.data);

      setOpenDeleteDialog(false);
      setDeletingAssignment(null);
      
      toast.success('과제가 성공적으로 삭제되었습니다.');
    } catch (error) {
      toast.error('과제 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePromoteToTA = async () => {
    try {
      await api.put(`/api/users/${promotingStudent.userId}/role`, {
        newRole: promotingStudent.newRole,
        courseId: course.courseId
      });
      
      const roleText = {
        'STUDENT': '학생',
        'ASSISTANT': '조교',
        'PROFESSOR': '교수'
      }[promotingStudent.newRole];
      
      toast.success(`${promotingStudent.name}님의 권한을 ${roleText}(으)로 변경했습니다.`);
      
      const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
      setStudents(studentsResponse.data);
      
      setOpenPromoteDialog(false);
      setPromotingStudent(null);
    } catch (error) {
      toast.error('권한 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleWithdrawUser = async () => {
    if (withdrawDialog.confirmText !== '사용자를 탈퇴시키겠습니다') {
      toast.error('정확한 확인 문구를 입력해주세요.');
      return;
    }

    try {
      await api.delete(`/api/users/${withdrawDialog.userId}/courses/${courseId}`);
      
      // 학생 목록 새로고침
      const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
      setStudents(studentsResponse.data);
      
      setWithdrawDialog({
        open: false,
        userId: null,
        userName: '',
        confirmText: ''
      });
      
      toast.success('사용자가 성공적으로 탈퇴되었습니다.');
    } catch (error) {
      toast.error('사용자 탈퇴 중 오류가 발생했습니다.');
    }
  };

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
          <Typography 
            color="error" 
            align="center"
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Container 
        maxWidth={false}
        sx={{ 
          mt: 2,
          px: 2,
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
            border: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
            borderRadius: '16px'
          }}
        >
          <WatcherBreadcrumbs 
            paths={[
              { 
                text: course?.courseName || '로딩중...', 
                to: `/watcher/class/${courseId}` 
              }
            ]} 
          />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: 2,
            mb: 4 
          }}>
            {/* 강의 정보 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  color: 'text.primary'
                }}
              >
                {course?.courseName}
              </Typography>
              <Box 
                component="span" 
                sx={{ 
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                }}
              >
                {course?.courseCode}
              </Box>
              <Box 
                component="span"
                sx={{ 
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: (theme) => theme.palette.action.hover
                }}
              >
                {course?.courseClss}분반
              </Box>
              <Box 
                component="span"
                sx={{ 
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: (theme) => theme.palette.action.hover
                }}
              >
                {course?.courseProfessor} 교수님
              </Box>
            </Box>
          </Box>

          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 3,
              minHeight: '40px',
              '& .MuiTab-root': {
                minHeight: '40px',
                padding: '6px 16px',
                fontSize: '0.875rem'
              }
            }}
          >
            {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') && (
              <Tab 
                icon={<GroupIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
                label="학생" 
                value="students"
                iconPosition="start"
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  textTransform: 'none',
                  minHeight: '40px',
                  alignItems: 'center'
                }}
              />
            )}
            <Tab 
              icon={<AssignmentIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
              label="과제" 
              value="assignments"
              iconPosition="start"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textTransform: 'none',
                minHeight: '40px',
                alignItems: 'center'
              }}
            />
          </Tabs>

          {/* 학생 목록 탭 */}
          {currentTab === 'students' && (
            <Fade in={currentTab === 'students'} timeout={300}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold', width: '60px' }}>
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
                        <TableRow 
                          key={student.email}
                          sx={{ 
                            transition: 'all 0.3s ease',
                            animation: 'fadeIn 0.3s ease',
                            backgroundColor: theme => {
                              if (student.courseRole === 'PROFESSOR') {
                                return theme.palette.mode === 'dark' 
                                  ? 'rgba(76, 175, 80, 0.08)' 
                                  : 'rgba(76, 175, 80, 0.05)';
                              } else if (student.courseRole === 'ASSISTANT') {
                                return theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 167, 38, 0.08)' 
                                  : 'rgba(255, 167, 38, 0.05)';
                              }
                              return 'transparent';
                            },
                            '@keyframes fadeIn': {
                              '0%': {
                                opacity: 0,
                                transform: 'translateY(10px)'
                              },
                              '100%': {
                                opacity: 1,
                                transform: 'translateY(0)'
                              }
                            }
                          }}
                        >
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", textAlign: 'center' }}>
                            {index + 1}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {student.studentNum}
                            {student.courseRole === 'PROFESSOR' && (
                              <Chip
                                label="교수"
                                size="small"
                                color="success"
                                sx={{ 
                                  ml: 1,
                                  height: '20px',
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.625rem'
                                  }
                                }}
                              />
                            )}
                            {student.courseRole === 'ASSISTANT' && (
                              <Chip
                                label="조교"
                                size="small"
                                color="warning"
                                sx={{ 
                                  ml: 1,
                                  height: '20px',
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.625rem'
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {student.name}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            {student.email}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {(user?.role === 'PROFESSOR' || user?.role === 'ADMIN') && 
                               student.courseRole !== 'PROFESSOR' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setWithdrawDialog({
                                      open: true,
                                      userId: student.userId,
                                      userName: student.name,
                                      confirmText: ''
                                    });
                                  }}
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
                                  탈퇴
                                </Button>
                              )}
                              
                              {(user?.role === 'PROFESSOR' || user?.role === 'ADMIN') && student.courseRole !== 'PROFESSOR' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<PeopleIcon sx={{ fontSize: '1rem' }} />}
                                  onClick={() => {
                                    setPromotingStudent({
                                      ...student,
                                      newRole: student.role
                                    });
                                    setOpenPromoteDialog(true);
                                  }}
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
                                  권한 변경
                                </Button>
                              )}
                              
                              {(user?.role === 'PROFESSOR' || user?.role === 'ADMIN' || user?.role === 'ASSISTANT') && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                                  onClick={async () => {
                                    try {
                                      // API 요청으로 리다이렉트 URL 가져오기
                                      const response = await api.post('/api/redirect', {
                                        userEmail: student.email,
                                        courseId: courseId
                                      }, { withCredentials: true });
                                      
                                      // 응답에서 최종 URL 추출
                                      const finalUrl = response.request?.responseURL || response.data?.url;
                                      
                                      if (!finalUrl) {
                                        throw new Error("리다이렉트 URL을 찾을 수 없습니다");
                                      }
                                      
                                      // 새 탭에서 URL 열기
                                      window.open(finalUrl, '_blank');
                                      
                                    } catch (err) {
                                      // 에러 처리
                                      toast.error('Web-IDE 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', {
                                        icon: ({theme, type}) => <ErrorIcon sx={{ color: '#fff', fontSize: '1.5rem', mr: 1 }}/>,
                                        style: {
                                          background: isDarkMode ? '#d32f2f' : '#f44336',
                                          color: '#fff',
                                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                          borderRadius: '8px',
                                          fontSize: '0.95rem',
                                          padding: '12px 20px',
                                          maxWidth: '500px',
                                          width: 'auto',
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }
                                      });
                                    }
                                  }}
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
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {getFilteredAndSortedStudents().length === 0 && (
                  <Typography 
                    sx={{ 
                      mt: 2, 
                      textAlign: 'center',
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                    }}
                  >
                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
                  </Typography>
                )}
              </Box>
            </Fade>
          )}

          {/* 과제 관리 탭 */}
          {currentTab === 'assignments' && (
            <Fade in={currentTab === 'assignments'} timeout={300}>
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          과제코드
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          과제명
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          시작일
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                          마감일
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold', width: '250px' }}>
                          남은 시간
                        </TableCell>
                        {user?.role !== 'STUDENT' && (
                          <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold', width: '100px' }}>
                            작업
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow 
                          key={assignment.assignmentId}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: (theme) => 
                                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell 
                            onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            {assignment.assignmentName}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {assignment.assignmentDescription}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            {new Date(assignment.kickoffDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            {new Date(assignment.deadlineDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                            sx={{ 
                              width: '250px',
                              textAlign: 'left'
                            }}
                          >
                            <RemainingTime deadline={assignment.deadlineDate} />
                          </TableCell>
                          {/* 학생이 아닌 경우에만 작업 셀을 표시 */}
                          {user?.role !== 'STUDENT' && (
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    
                                    // 날짜 형식 변환 (yyyy-MM-ddTHH:mm 형식으로)
                                    const formatToLocalDateTimeString = (dateString) => {
                                      const date = new Date(dateString);
                                      
                                      // 로컬 시간대의 연, 월, 일, 시, 분 추출
                                      const year = date.getFullYear();
                                      const month = String(date.getMonth() + 1).padStart(2, '0');
                                      const day = String(date.getDate()).padStart(2, '0');
                                      const hours = String(date.getHours()).padStart(2, '0');
                                      const minutes = String(date.getMinutes()).padStart(2, '0');
                                      
                                      // HTML datetime-local 입력에 필요한 형식 (YYYY-MM-DDThh:mm)
                                      return `${year}-${month}-${day}T${hours}:${minutes}`;
                                    };
                                    
                                    setEditingAssignment({
                                      ...assignment,
                                      originalAssignmentName: assignment.assignmentName,
                                      kickoffDate: formatToLocalDateTimeString(assignment.kickoffDate),
                                      deadlineDate: formatToLocalDateTimeString(assignment.deadlineDate)
                                    });
                                    setOpenEditDialog(true);
                                  }}
                                  size="small"
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: (theme) => 
                                        theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingAssignment(assignment);
                                    setOpenDeleteDialog(true);
                                  }}
                                  size="small"
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: (theme) => 
                                        theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {/* 학생이 아닌 경우에만 과제 추가 행을 표시 */}
                      {user?.role !== 'STUDENT' && (
                        <TableRow
                          onClick={() => setOpenAssignmentDialog(true)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: (theme) => 
                                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            },
                            transition: 'all 0.2s ease',
                            height: '60px'
                          }}
                        >
                          <TableCell 
                            colSpan={6}
                            align="center"
                            sx={{ 
                              border: (theme) => `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                              borderRadius: 1,
                              m: 1,
                            }}
                          >
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: 1,
                                color: 'text.secondary'
                              }}
                            >
                              <AddIcon />
                              <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                                새 과제 추가
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Fade>
          )}

          <Dialog 
            open={openAssignmentDialog} 
            onClose={() => setOpenAssignmentDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                minHeight: '500px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '1.5rem',
                py: 3
              }}
            >
              새 과제 추가
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
                <Typography sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>주의:</Box> 
                  현재 버전에서는 과제코드가 hw1~hw10까지만 지원됩니다.
                </Typography>
              </Box>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="과제코드"
                    value={newAssignment.assignmentName}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      assignmentName: e.target.value 
                    })}
                    error={isAssignmentCodeExists(newAssignment.assignmentName)}
                    helperText={isAssignmentCodeExists(newAssignment.assignmentName) ? 
                      "이미 존재하는 과제코드입니다" : ""}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  >
                    {[...Array(10)].map((_, index) => {
                      const code = `hw${index + 1}`;
                      const exists = isAssignmentCodeExists(code);
                      return (
                        <MenuItem 
                          key={index} 
                          value={code}
                          disabled={exists}
                          sx={{
                            color: exists ? 'text.disabled' : 'text.primary',
                            '&.Mui-disabled': {
                              opacity: 0.7,
                            }
                          }}
                        >
                          {code} {exists && '(이미 존재함)'}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과제명"
                    value={newAssignment.assignmentDescription}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      assignmentDescription: e.target.value 
                    })}
                    error={!newAssignment.assignmentDescription && newAssignment.assignmentName}
                    helperText={!newAssignment.assignmentDescription && newAssignment.assignmentName ? 
                      "과제명을 입력해주세요" : ""}
                    multiline
                    rows={6}
                    placeholder="과제명을 입력하세요"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="시작 일시"
                    type="datetime-local"
                    value={newAssignment.kickoffDate}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      kickoffDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    error={!newAssignment.kickoffDate && newAssignment.assignmentName}
                    helperText={!newAssignment.kickoffDate && newAssignment.assignmentName ? 
                      "시작 일시를 선택해주세요" : ""}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="마감 일시"
                    type="datetime-local"
                    value={newAssignment.deadlineDate}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      deadlineDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    error={
                      (!newAssignment.deadlineDate && newAssignment.assignmentName) || 
                      (newAssignment.kickoffDate && newAssignment.deadlineDate && 
                      new Date(newAssignment.kickoffDate) >= new Date(newAssignment.deadlineDate))
                    }
                    helperText={
                      !newAssignment.deadlineDate && newAssignment.assignmentName ? 
                        "마감 일시를 선택해주세요" : 
                        (newAssignment.kickoffDate && newAssignment.deadlineDate && 
                        new Date(newAssignment.kickoffDate) >= new Date(newAssignment.deadlineDate) ? 
                        "마감일시는 시작일시보다 나중이어야 합니다" : "")
                    }
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setOpenAssignmentDialog(false)}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button 
                onClick={handleAddAssignment} 
                variant="contained"
                size="small"
                disabled={
                  !newAssignment.assignmentName || 
                  !newAssignment.assignmentDescription || 
                  !newAssignment.kickoffDate || 
                  !newAssignment.deadlineDate ||
                  new Date(newAssignment.kickoffDate) >= new Date(newAssignment.deadlineDate) ||
                  isAssignmentCodeExists(newAssignment.assignmentName)
                }
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
                추가
              </Button>
            </DialogActions>
          </Dialog>

          {/* 과제 수정 다이얼로그 */}
          <Dialog 
            open={openEditDialog} 
            onClose={() => {
              setOpenEditDialog(false);
              setEditingAssignment(null);
            }}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                minHeight: '500px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '1.5rem',
                py: 3
              }}
            >
              과제 수정
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
                <Typography sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>주의:</Box> 
                  현재 버전에서는 과제코드가 hw1~hw10까지만 지원됩니다.
                </Typography>
              </Box>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="과제코드"
                    value={editingAssignment?.assignmentName || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      assignmentName: e.target.value 
                    })}
                    error={isAssignmentCodeExists(editingAssignment?.assignmentName) && 
                           editingAssignment?.assignmentName !== editingAssignment?.originalAssignmentName}
                    helperText={isAssignmentCodeExists(editingAssignment?.assignmentName) && 
                               editingAssignment?.assignmentName !== editingAssignment?.originalAssignmentName ? 
                      "이미 존재하는 과제코드입니다" : ""}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  >
                    {[...Array(10)].map((_, index) => {
                      const code = `hw${index + 1}`;
                      const exists = isAssignmentCodeExists(code) && code !== editingAssignment?.originalAssignmentName;
                      return (
                        <MenuItem 
                          key={index} 
                          value={code}
                          disabled={exists}
                          sx={{
                            color: exists ? 'text.disabled' : 'text.primary',
                            '&.Mui-disabled': {
                              opacity: 0.7,
                            }
                          }}
                        >
                          {code} {exists && '(이미 존재함)'}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과제명"
                    value={editingAssignment?.assignmentDescription || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      assignmentDescription: e.target.value 
                    })}
                    error={!editingAssignment?.assignmentDescription}
                    helperText={!editingAssignment?.assignmentDescription ? 
                      "과제명을 입력해주세요" : ""}
                    multiline
                    rows={6}
                    placeholder="과제에 대한 설명을 입력하세요"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="시작 일시"
                    type="datetime-local"
                    value={editingAssignment?.kickoffDate || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      kickoffDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    error={!editingAssignment?.kickoffDate}
                    helperText={!editingAssignment?.kickoffDate ? 
                      "시작 일시를 선택해주세요" : ""}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="마감 일시"
                    type="datetime-local"
                    value={editingAssignment?.deadlineDate || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      deadlineDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    error={
                      (!editingAssignment?.deadlineDate) || 
                      (editingAssignment?.kickoffDate && editingAssignment?.deadlineDate && 
                      new Date(editingAssignment.kickoffDate) >= new Date(editingAssignment.deadlineDate))
                    }
                    helperText={
                      !editingAssignment?.deadlineDate ? 
                        "마감 일시를 선택해주세요" : 
                        (editingAssignment?.kickoffDate && editingAssignment?.deadlineDate && 
                        new Date(editingAssignment.kickoffDate) >= new Date(editingAssignment.deadlineDate) ? 
                        "마감일시는 시작일시보다 나중이어야 합니다" : "")
                    }
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => {
                  setOpenEditDialog(false);
                  setEditingAssignment(null);
                }}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button 
                onClick={handleEditAssignment} 
                variant="contained"
                size="small"
                disabled={
                  !editingAssignment?.assignmentName || 
                  !editingAssignment?.assignmentDescription || 
                  !editingAssignment?.kickoffDate || 
                  !editingAssignment?.deadlineDate ||
                  new Date(editingAssignment?.kickoffDate) >= new Date(editingAssignment?.deadlineDate) ||
                  (isAssignmentCodeExists(editingAssignment?.assignmentName) && 
                   editingAssignment?.assignmentName !== editingAssignment?.originalAssignmentName)
                }
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
                수정
              </Button>
            </DialogActions>
          </Dialog>

          {/* 과제 삭제 확인 다이얼로그 */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setDeletingAssignment(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              fontSize: '1.25rem',
              py: 3
            }}>
              과제 삭제 확인
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                정말로 "{deletingAssignment?.assignmentName}" 과제를 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setDeletingAssignment(null);
                }}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button
                onClick={handleDeleteAssignment}
                variant="contained"
                color="error"
                size="small"
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
                삭제
              </Button>
            </DialogActions>
          </Dialog>

          {/* 권한 변경 다이얼로그 */}
          <Dialog
            open={openPromoteDialog}
            onClose={() => {
              setOpenPromoteDialog(false);
              setPromotingStudent(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              fontSize: '1.25rem',
              py: 3
            }}>
              권한 변경
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  mb: 2 
                }}>
                  {promotingStudent?.name}님의 권한을 변경합니다.
                </Typography>
                <Select
                  fullWidth
                  value={promotingStudent?.newRole || 'STUDENT'}
                  onChange={(e) => setPromotingStudent(prev => ({
                    ...prev,
                    newRole: e.target.value
                  }))}
                  size="small"
                >
                  <MenuItem value="STUDENT">학생</MenuItem>
                  <MenuItem value="ASSISTANT">조교</MenuItem>
                  {user?.role === 'ADMIN' && (
                    <MenuItem value="PROFESSOR">교수</MenuItem>
                  )}
                </Select>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => {
                  setOpenPromoteDialog(false);
                  setPromotingStudent(null);
                }}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button
                onClick={handlePromoteToTA}
                variant="contained"
                color="warning"
                size="small"
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
                변경
              </Button>
            </DialogActions>
          </Dialog>

          {/* 사용자 탈퇴 다이얼로그 */}
          <Dialog
            open={withdrawDialog.open}
            onClose={() => setWithdrawDialog({ ...withdrawDialog, open: false })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              color: '#f44336'
            }}>
              사용자 탈퇴 확인
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ mt: 2, mb: 2 }} color="error">
                ⚠️ 주의: 사용자 탈퇴 시 다음 사항을 확인해주세요
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 해당 사용자의 모든 강의 데이터와 제출물이 삭제됩니다.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 삭제된 데이터는 복구가 불가능합니다.
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                • 재참가 시 새로운 참가 코드가 필요합니다.
              </Typography>
              
              <Typography sx={{ mb: 2 }}>
                정말로 <strong>{withdrawDialog.userName}</strong> 님을 강의에서 탈퇴시키겠습니까?
              </Typography>

              <TextField
                fullWidth
                label="확인을 위해 '사용자를 탈퇴시키겠습니다'를 입력하세요"
                value={withdrawDialog.confirmText}
                onChange={(e) => setWithdrawDialog({ ...withdrawDialog, confirmText: e.target.value })}
                error={withdrawDialog.confirmText !== '' && withdrawDialog.confirmText !== '사용자를 탈퇴시키겠습니다'}
                helperText={withdrawDialog.confirmText !== '' && withdrawDialog.confirmText !== '사용자를 탈퇴시키겠습니다' ? 
                  '정확한 문구를 입력해주세요' : ''}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setWithdrawDialog({ ...withdrawDialog, open: false })}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button 
                onClick={handleWithdrawUser}
                variant="contained"
                color="error"
                disabled={withdrawDialog.confirmText !== '사용자를 탈퇴시키겠습니다'}
                size="small"
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
                탈퇴
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassDetail; 