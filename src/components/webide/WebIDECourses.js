import React, { useEffect, useState } from 'react';
import { 
  Container, 
  CircularProgress, 
  Typography, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Paper,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import CodeIcon from '@mui/icons-material/Code';
import { selectStyles } from '../../styles/selectStyles';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingSpinner } from '../ui';

const WebIDECourses = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [joinDialog, setJoinDialog] = useState({
    open: false,
    courseKey: ''
  });
  const [withdrawDialog, setWithdrawDialog] = useState({
    open: false,
    courseId: null,
    courseName: '',
    confirmText: '',
    doubleCheck: false
  });
  // 사용자 역할 확인 (교수, 조교, 관리자)
  const isAuthorized = user && (user.role === 'PROFESSOR' || user.role === 'ASSISTANT' || user.role === 'ADMIN');

  // 고유한 연도와 학기 목록 추출
  const years = [...new Set(courses.map(course => course.courseYear))].sort((a, b) => b - a);
  const terms = [...new Set(courses.map(course => course.courseTerm))].sort();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/users/me/courses');
        if (Array.isArray(response.data)) {
          setCourses(response.data);
          if (response.data.length > 0) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const currentTerm = currentMonth >= 9 ? 2 : 1;
            setSelectedYear(currentYear);
            setSelectedTerm(currentTerm);
          } else {
            setSelectedYear('all');
            setSelectedTerm('all');
          }
        } else {
          setCourses([]);
          setSelectedYear('all');
          setSelectedTerm('all');
        }
        setLoading(false);
      } catch (err) {
        setError('수업 목록을 불러오는데 실패했습니다.');
        setCourses([]);
        setLoading(false);
        setSelectedYear('all');
        setSelectedTerm('all');
      }
    };

    fetchCourses();
  }, []);

  const handleWebIDEOpen = async (courseId, isSnapshot = false) => {
    try {
      if (isSnapshot) {
        try {
          await api.post(`/api/courses/${courseId}/jcodes`, {
            userEmail: user.email,
            snapshot: true
          });
        } catch (error) {
          // JCode가 이미 존재하는 경우(403 에러) 무시하고 계속 진행
          if (error.response?.status !== 403) {
            throw error; // 403이 아닌 다른 에러는 다시 throw
          }
        }
      }

      // API 요청으로 리다이렉트 URL 가져오기
      const response = await api.post('/api/redirect', {
        userEmail: user.email,
        courseId: courseId,
        snapshot: isSnapshot
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
  };

  const handleJoinCourse = async () => {
    try {
      const joinResponse = await api.post('/api/users/me/courses', {
        courseKey: joinDialog.courseKey
      });
      // 수업 참가 성공 후 JCode 생성 API 호출
      const courseId = joinResponse.data.courseId;
      try {
        await api.post(`/api/courses/${courseId}/jcodes`, {
          userEmail: user.email
        });
      } catch (jcodeError) {
        // JCode 생성 실패 시 오류 메시지 표시
        toast.error('JCode 생성에 실패했습니다. 나중에 다시 시도해주세요.', {
          icon: ({theme, type}) => <ErrorIcon sx={{ 
            color: '#fff',
            fontSize: '1.5rem',
            mr: 1
          }}/>,
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
      
      // 수업 목록 새로고침
      const response = await api.get('/api/users/me/courses');
      setCourses(response.data);
      
      // 다이얼로그 닫기 및 초기화
      setJoinDialog({
        open: false,
        courseKey: ''
      });
      
      // 성공 토스트
      toast.success('수업 참가가 완료되었습니다.', {
        icon: ({theme, type}) => <CheckCircleIcon sx={{ 
          color: '#fff',
          fontSize: '1.5rem',
          mr: 1
        }}/>,
        style: {
          background: isDarkMode ? '#2e7d32' : '#4caf50',
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
    } catch (error) {
      const errorMessage = error.response?.status === 400 ? "올바르지 않은 참가 코드 형식입니다."
        : error.response?.status === 404 ? "존재하지 않는 수업입니다."
        : error.response?.status === 401 ? "잘못된 참가 코드입니다."
        : error.response?.status === 409 ? "이미 참가한 수업입니다."
        : "수업 참가 중 오류가 발생했습니다.";
      
      // 에러 토스트
      toast.error(errorMessage, {
        icon: ({theme, type}) => <ErrorIcon sx={{ 
          color: '#fff',
          fontSize: '1.5rem',
          mr: 1
        }}/>,
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
  };

  const handleWithdrawCourse = async () => {
    if (withdrawDialog.confirmText !== '강의를 탈퇴하겠습니다') {
      toast.error('정확한 확인 문구를 입력해주세요.', {
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
      return;
    }

    try {
      // JCode 삭제 시도
      try {
        await api.delete(`/api/users/me/courses/${withdrawDialog.courseId}/jcodes`);
      } catch (jcodeError) {
        console.error('JCode 삭제 중 오류:', jcodeError);
        // JCode 삭제 실패 시에도 강의 탈퇴는 계속 진행
      }

      // 강의 탈퇴 진행
      await api.delete(`/api/users/me/courses/${withdrawDialog.courseId}`);
      
      // 강의 목록 새로고침
      const response = await api.get('/api/users/me/courses');
      setCourses(response.data);
      
      setWithdrawDialog({
        open: false,
        courseId: null,
        courseName: '',
        confirmText: '',
        doubleCheck: false
      });
      
      toast.success('강의 탈퇴가 완료되었습니다.', {
        icon: ({theme, type}) => <CheckCircleIcon sx={{ color: '#fff', fontSize: '1.5rem', mr: 1 }}/>,
        style: {
          background: isDarkMode ? '#2e7d32' : '#4caf50',
          color: '#fff',
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
          borderRadius: '8px',
          fontSize: '0.95rem',
          padding: '12px 20px'
        }
      });
    } catch (error) {
      toast.error('강의 탈퇴 중 오류가 발생했습니다.', {
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

  // 필터링된 강의 목록
  const filteredCourses = courses.filter(course => {
    const yearMatch = selectedYear === 'all' || course.courseYear === selectedYear;
    const termMatch = selectedTerm === 'all' || course.courseTerm === selectedTerm;
    return yearMatch && termMatch;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>  
        <Paper elevation={0} sx={{ 
          p: 3,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
          borderRadius: '16px'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h5">
              수강 중인 강의 ({filteredCourses.length})
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl sx={{ minWidth: 100 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  displayEmpty
                  size="small"
                  MenuProps={selectStyles.menuProps}
                  sx={{
                    ...selectStyles.select,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    }
                  }}
                >
                  <MenuItem value="all" sx={selectStyles.menuItem}>
                    전체 연도
                  </MenuItem>
                  {years.map(year => (
                    <MenuItem key={year} value={year} sx={selectStyles.menuItem}>
                      {year}년
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 90 }}>
                <Select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  displayEmpty
                  size="small"
                  MenuProps={selectStyles.menuProps}
                  sx={selectStyles.select}
                >
                  <MenuItem value="all" sx={selectStyles.menuItem}>
                    전체 학기
                  </MenuItem>
                  {terms.map(term => (
                    <MenuItem key={term} value={term} sx={selectStyles.menuItem}>
                      {term}학기
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 1.5, 
              mb: 2,
              bgcolor: 'warning.light', 
              color: 'warning.contrastText',
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${theme.palette.warning.main}`,
            }}
          >
            <Typography 
              variant="body2"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.85rem'
              }}
            >
              <Box component="span" sx={{ fontWeight: 'bold' }}>주의:</Box> 
              강의 참가 후 JCode 최초 실행 시 JCode가 생성되고 있으므로 오류가 발생할 수 있습니다. 잠시 후 다시 시도해주세요
            </Typography>
          </Paper>
          
          {filteredCourses.length === 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  mb: 3,
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? '#44475A' : '#FFFFFF',
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      해당하는 강의가 없습니다.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  onClick={() => setJoinDialog({ ...joinDialog, open: true })}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
                    border: (theme) =>
                      `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
                    boxShadow: 'none',
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#6272A4' : '#BDBDBD',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#44475A' : '#FAFAFA',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      새 수업 참가
                    </Typography>
                    <Chip 
                      icon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      label="수업 참가하기"
                      color="primary"
                      size="small"
                      sx={{ 
                        mb: 2,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        backgroundColor: 'transparent',
                        border: '1px dashed',
                        borderRadius: '20px',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        '& .MuiChip-icon': {
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main'
                        }
                      }}
                    />
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.875rem',
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      교수님으로부터 받은 참가 코드로 새로운 수업에 참가하세요.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.courseId}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      animation: 'fadeIn 0.3s ease',
                      '@keyframes fadeIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateY(10px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      },
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
                      border: (theme) =>
                        `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
                      boxShadow: 'none',
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#6272A4' : '#BDBDBD',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#44475A' : '#FAFAFA'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWithdrawDialog({
                              open: true,
                              courseId: course.courseId,
                              courseName: course.courseName,
                              confirmText: '',
                              doubleCheck: false
                            });
                          }}
                          sx={{
                            color: (theme) => theme.palette.mode === 'dark' ? '#FF5555' : '#f44336',
                            '&:hover': {
                              backgroundColor: (theme) => 
                                theme.palette.mode === 'dark' ? 'rgba(255, 85, 85, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseName}
                      </Typography>
                      <Chip 
                        label={course.courseCode}
                        color="primary"
                        size="small"
                        sx={{ 
                          mb: 2,
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                        }}
                      />
                      <Typography 
                        color="text.secondary" 
                        gutterBottom
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        담당 교수: {course.courseProfessor} 교수님
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseYear}년 {course.courseTerm}학기
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseClss}분반
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                        onClick={() => handleWebIDEOpen(course.courseId, false)}
                        size="small"
                        sx={{
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.5,
                          minHeight: '28px',
                          borderRadius: '20px',
                          textTransform: 'none',
                          flex: isAuthorized ? 1 : 'auto'
                        }}
                      >
                        JCode 실행
                      </Button>
                      
                      {isAuthorized && (
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                          onClick={() => handleWebIDEOpen(course.courseId, true)}
                          size="small"
                          sx={{
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1.5,
                            minHeight: '28px',
                            borderRadius: '20px',
                            textTransform: 'none',
                            ml: 1,
                            flex: 1,
                            borderColor: (theme) =>
                              theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                            color: (theme) =>
                              theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                            '&:hover': {
                              borderColor: (theme) =>
                                theme.palette.mode === 'dark' ? '#FF92D0' : 'primary.dark',
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'dark' ? 'rgba(255, 121, 198, 0.1)' : 'rgba(63, 81, 181, 0.1)'
                            }
                          }}
                        >
                          스냅샷 확인
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  onClick={() => setJoinDialog({ ...joinDialog, open: true })}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
                    border: (theme) =>
                      `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
                    boxShadow: 'none',
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#6272A4' : '#BDBDBD',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#44475A' : '#FAFAFA',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      새 수업 참가
                    </Typography>
                    <Chip 
                      icon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      label="수업 참가하기"
                      color="primary"
                      size="small"
                      sx={{ 
                        mb: 2,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        backgroundColor: 'transparent',
                        border: '1px dashed',
                        borderRadius: '20px',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        '& .MuiChip-icon': {
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main'
                        }
                      }}
                    />
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.875rem',
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      교수님으로부터 받은 참가 코드로 새로운 수업에 참가하세요.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Dialog
            open={joinDialog.open}
            onClose={() => setJoinDialog({ open: false, courseKey: '' })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              수업 참가
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="참가 코드"
                  value={joinDialog.courseKey}
                  onChange={(e) => {
                    setJoinDialog({ ...joinDialog, courseKey: e.target.value });
                  }}
                  placeholder="참가 코드를 입력하세요"
                  helperText="교수님으로부터 받은 참가 코드를 입력해주세요"
                  InputProps={{
                    sx: { 
                      fontFamily: "'JetBrains Mono', monospace",
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setJoinDialog({ open: false, courseKey: '' })}
              >
                취소
              </Button>
              <Button 
                onClick={handleJoinCourse}
                variant="contained"
                disabled={!joinDialog.courseKey.trim()}
              >
                참가
              </Button>
            </DialogActions>
          </Dialog>

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
              강의 탈퇴 확인
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ mt: 2, mb: 2 }} color="error">
                ⚠️ 주의: 강의 탈퇴 시 다음 사항을 확인해주세요
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 모든 강의 데이터와 제출물이 삭제됩니다.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 삭제된 데이터는 복구가 불가능합니다.
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                • 재참가 시 새로운 참가 코드가 필요합니다.
              </Typography>
              
              <Typography sx={{ mb: 2 }}>
                정말로 <strong>{withdrawDialog.courseName}</strong> 강의를 탈퇴하시겠습니까?
              </Typography>

              <TextField
                fullWidth
                label="확인을 위해 '강의를 탈퇴하겠습니다'를 입력하세요"
                value={withdrawDialog.confirmText}
                onChange={(e) => setWithdrawDialog({ ...withdrawDialog, confirmText: e.target.value })}
                error={withdrawDialog.confirmText !== '' && withdrawDialog.confirmText !== '강의를 탈퇴하겠습니다'}
                helperText={withdrawDialog.confirmText !== '' && withdrawDialog.confirmText !== '강의를 탈퇴하겠습니다' ? 
                  '정확한 문구를 입력해주세요' : ''}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setWithdrawDialog({ ...withdrawDialog, open: false })}>
                취소
              </Button>
              <Button 
                onClick={handleWithdrawCourse}
                variant="contained"
                color="error"
                disabled={withdrawDialog.confirmText !== '강의를 탈퇴하겠습니다'}
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

export default WebIDECourses; 