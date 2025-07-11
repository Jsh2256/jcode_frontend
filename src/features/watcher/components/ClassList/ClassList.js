import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemButton,
  CircularProgress,
  Box,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputLabel,
  IconButton,
  Card,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../api/axios';
import { selectStyles } from '../../../../styles/selectStyles';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../contexts/AuthContext';
import { LoadingSpinner, Button } from '../../../../components/ui';

const ClassList = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [newClass, setNewClass] = useState({
    code: '',
    name: '',
    professor: '',
    year: new Date().getFullYear(),
    term: 1,
    clss: '',
    vnc: false,
  });
  const [formErrors, setFormErrors] = useState({
    courseClss: '',
    courseCode: ''
  });
  const [courseKeyDialog, setCourseKeyDialog] = useState({
    open: false,
    courseKey: '',
    courseId: null,
  });
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // 고유한 연도와 학기 목록 추출
  const years = [...new Set(classes.map(course => course.courseYear))].sort((a, b) => b - a);
  const terms = [...new Set(classes.map(course => course.courseTerm))].sort();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let response;
        
        if (user?.role === 'ADMIN') {
          response = await axios.get('/api/courses');
        } else if (user?.role === 'ASSISTANT') {
          response = await axios.get('/api/users/me/assistant/courses');
        } else {
          response = await axios.get('/api/users/me/courses');
        }
        
        const formattedData = user?.role === 'ADMIN' ? 
          response.data.map(course => ({
            courseId: course.courseId,
            courseName: course.name,
            courseCode: course.code,
            courseProfessor: course.professor,
            courseYear: course.year,
            courseTerm: course.term,
            courseClss: course.clss
          })) : response.data;
        
        setClasses(formattedData);
        setLoading(false);
      } catch (error) {
        setError('수업 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    // 현재 날짜 기준으로 연도와 학기 설정 (courses와 독립적으로 실행)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentTerm = currentMonth >= 9 ? 2 : 1;
    
    setSelectedYear(currentYear);
    setSelectedTerm(currentTerm);

    fetchClasses();
  }, [user]);

  // 필터링된 강의 목록
  const filteredClasses = classes.filter(course => {
    const yearMatch = selectedYear === 'all' || course.courseYear === selectedYear;
    const termMatch = selectedTerm === 'all' || course.courseTerm === selectedTerm;
    return yearMatch && termMatch;
  });

  // 유효성 검사 함수
  const validateForm = () => {
    let isValid = true;
    const errors = { courseClss: '', courseCode: '' };

    // 분반 유효성 검사 - 숫자만 허용
    if (!/^\d+$/.test(newClass.clss)) {
      errors.courseClss = '분반은 숫자만 입력 가능합니다';
      isValid = false;
    }

    // 과목 코드 유효성 검사 - 영문자로 시작하고 영문자+숫자 조합만 허용
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(newClass.code)) {
      errors.courseCode = '영문자로 시작하고 영문자와 숫자만 사용 가능합니다';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddClass = async () => {
    if (!validateForm()) return;
    
    try {
      const createResponse = await axios.post('/api/courses', {
        code: newClass.code,
        name: newClass.name,
        professor: newClass.professor,
        year: newClass.year,
        term: newClass.term,
        clss: parseInt(newClass.clss),
        vnc: newClass.vnc
      });

      const { courseId, courseKey } = createResponse.data;

      await axios.post(`/api/users/me/courses`, {
        courseKey: courseKey
      });

      const response = await axios.get('/api/users/me/courses');
      setClasses(response.data);

      setOpenDialog(false);
      setNewClass({
        code: '',
        name: '',
        professor: '',
        year: new Date().getFullYear(),
        term: 1,
        clss: '',
        vnc: false,
      });
      setFormErrors({ courseClss: '', courseCode: '' });

      setCourseKeyDialog({
        open: true,
        courseKey: courseKey,
        courseId: courseId
      });

    } catch (error) {
      setError('수업 추가에 실패했습니다.');
    }
  };

  // 복사 버튼 클릭 핸들러
  const handleCopy = async () => {
    await navigator.clipboard.writeText(courseKeyDialog.courseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2초 후 사라짐
  };

  // 재발급 핸들러 수정
  const handleRegenerateKey = async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/key`);
      setCourseKeyDialog({
        open: true,
        courseKey: response.data,
        courseId: courseId
      });
    } catch (error) {
      setError('참가 코드 재발급에 실패했습니다.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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
            <Typography 
              variant="h5"
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            >
              수업 목록 ({filteredClasses.length})
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl sx={{ minWidth: 100 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  displayEmpty
                  size="small"
                  MenuProps={selectStyles.menuProps}
                  sx={selectStyles.select}
                >
                  <MenuItem 
                    value="all" 
                    sx={{ 
                      ...selectStyles.menuItem,
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                    }}
                  >
                    전체 연도
                  </MenuItem>
                  {years.map(year => (
                    <MenuItem 
                      key={year} 
                      value={year}
                      sx={{ 
                        ...selectStyles.menuItem,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                      }}
                    >
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
                  <MenuItem 
                    value="all" 
                    sx={{ 
                      ...selectStyles.menuItem,
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                    }}
                  >
                    전체 학기
                  </MenuItem>
                  {terms.map(term => (
                    <MenuItem 
                      key={term} 
                      value={term}
                      sx={{ 
                        ...selectStyles.menuItem,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                      }}
                    >
                      {term}학기
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {user?.role === 'PROFESSOR' && (
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
                현재 버전에서의 수업 생성은 jedutools@gmail.com으로 문의바랍니다.
              </Typography>
            </Paper>
          )}

          <List>
            {filteredClasses.map((classItem, index) => (
              <ListItem 
                key={index} 
                disablePadding 
                divider
                sx={{
                  ...selectStyles.listItem,
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
                  }
                }}
              >
                <ListItemButton 
                  sx={{
                    ...selectStyles.listItemButton,
                    width: '100%'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      width: '100%'
                    }}
                  >
                    <Box 
                      onClick={() => navigate(`/watcher/class/${classItem.courseId}`)}
                      sx={{ flex: 1 }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                              {classItem.courseName}
                            </Typography>
                            <Chip 
                              label={classItem.courseCode} 
                              size="small" 
                              color="primary"
                              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              color: 'text.secondary',
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            {classItem.courseYear}년 {classItem.courseTerm}학기 | {classItem.courseClss}분반 | {classItem.courseProfessor} 교수님
                          </Typography>
                        }
                        primaryTypographyProps={{ 
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" 
                        }}
                        secondaryTypographyProps={{ 
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                          sx: { mt: 0.5 }
                        }}
                      />
                    </Box>
                    {user?.role !== 'ASSISTANT' && user?.role !== 'STUDENT' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateKey(classItem.courseId);
                        }}
                        startIcon={<RefreshIcon sx={{ fontSize: '1rem' }} />}
                        size="small"
                        variant="outlined"
                        sx={{
                          ml: 2,
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                          minWidth: 'auto',
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1,
                          height: '28px',
                          '& .MuiButton-startIcon': {
                            mr: 0.5
                          }
                        }}
                      >
                        참가 코드 재발급
                      </Button>
                    )}
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {filteredClasses.length === 0 && (
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textAlign: 'center'
              }}
            >
              해당하는 강의가 없습니다.
            </Typography>
          )}

          {user?.role === 'ADMIN' && (
            <ListItem 
              disablePadding 
              divider
              onClick={() => setOpenDialog(true)}
              sx={{
                ...selectStyles.listItem,
                cursor: 'pointer',
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                },
                transition: 'background-color 0.2s ease'
              }}
            >
              <ListItemButton 
                sx={{
                  ...selectStyles.listItemButton,
                  width: '100%',
                  justifyContent: 'center',
                  py: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: (theme) => theme.palette.text.secondary
                }}>
                  <AddIcon sx={{ fontSize: '1.1rem' }} />
                  <Typography sx={{ 
                    fontSize: '0.9rem',
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                  }}>
                    새 수업 추가
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          )}

          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              새 수업 추가
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과목 코드"
                    value={newClass.code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z0-9]/g, ''); // 영문자와 숫자만 허용
                      setNewClass({ ...newClass, code: value });
                      if (formErrors.courseCode) {
                        setFormErrors({ ...formErrors, courseCode: '' });
                      }
                    }}
                    onBlur={() => {
                      if (newClass.code && !/^[A-Za-z][A-Za-z0-9]*$/.test(newClass.code)) {
                        setFormErrors({
                          ...formErrors,
                          courseCode: '영문자로 시작하고 영문자와 숫자만 사용 가능합니다'
                        });
                      }
                    }}
                    placeholder="ex) CSE1001"
                    helperText={formErrors.courseCode || "영문자로 시작하고 영문자와 숫자만 입력 가능합니다 | 별칭이므로 오아시스와 상관 없습니다"}
                    error={Boolean(formErrors.courseCode)}
                    inputProps={{
                      style: { textTransform: 'uppercase' } // 자동으로 대문자 변환
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과목명"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="ex) C++ 프로그래밍"
                    helperText="과목 이름을 입력하세요 (ex: C++ 프로그래밍)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="교수명"
                    value={newClass.professor}
                    onChange={(e) => setNewClass({ ...newClass, professor: e.target.value })}
                    placeholder="ex) 홍길동"
                    helperText="교수님 성함을 입력해주십시오"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    alignItems: 'flex-start'
                  }}>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>연도</InputLabel>
                      <Select
                        value={newClass.year}
                        onChange={(e) => setNewClass({ ...newClass, year: e.target.value })}
                        label="연도"
                        size="medium"
                        fullWidth
                      >
                        {[2024, 2025, 2026].map(year => (
                          <MenuItem key={year} value={year}>
                            {year}년
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>학기</InputLabel>
                      <Select
                        value={newClass.term}
                        onChange={(e) => setNewClass({ ...newClass, term: e.target.value })}
                        label="학기"
                        size="medium"
                        fullWidth
                      >
                        {[1, 2].map(term => (
                          <MenuItem key={term} value={term}>
                            {term}학기
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="분반"
                      value={newClass.clss}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewClass({ ...newClass, clss: value });
                        if (formErrors.courseClss) {
                          setFormErrors({ ...formErrors, courseClss: '' });
                        }
                      }}
                      type="text"
                      inputProps={{
                        pattern: '[0-9]*',
                        inputMode: 'numeric',
                        style: { textAlign: 'center' }
                      }}
                      placeholder="1"
                      helperText={formErrors.courseClss || "숫자만 입력"}
                      error={Boolean(formErrors.courseClss)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 1,
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      border: (theme) =>
                        `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newClass.vnc}
                          onChange={(e) => setNewClass({ ...newClass, vnc: e.target.checked })}
                          sx={{
                            '&.Mui-checked': {
                              color: 'primary.main',
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography 
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            VNC 사용
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              fontSize: '0.8rem'
                            }}
                          >
                            VNC를 사용하여 Python GUI 환경을 설정합니다.
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>취소</Button>
              <Button onClick={handleAddClass} variant="contained">추가</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={courseKeyDialog.open}
            onClose={() => setCourseKeyDialog({ open: false, courseKey: '', courseId: null })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              {courseKeyDialog.courseId ? '참가 코드 재발급 완료' : '강의 개설 완료'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography 
                  sx={{ 
                    mb: 2,
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    color: 'warning.main',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6
                  }}
                >
                  ※ 이 참가 코드는 학생들의 수업 참여에 필요합니다. ※{'\n'}
                   반드시 저장해주세요. {'\n'} 저장을 안하고 이 창을 나가면 참가코드는 신규 발급 해야합니다. 
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    value={courseKeyDialog.courseKey}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Box sx={{ position: 'relative' }}>
                          <Button
                            onClick={handleCopy}
                            sx={{
                              minWidth: 'auto',
                              p: 1,
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'transparent',
                                color: 'primary.dark',
                              }
                            }}
                          >
                            <ContentCopyIcon />
                          </Button>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 'calc(100% + 4px)',
                              right: 0,
                              backgroundColor: 'background.paper',
                              color: 'success.main',
                              fontSize: '0.75rem',
                              py: 0.5,
                              px: 1,
                              borderRadius: 1,
                              boxShadow: 1,
                              opacity: copied ? 1 : 0,
                              transform: copied ? 'translateY(-4px)' : 'translateY(0)',
                              transition: 'all 0.2s ease',
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              zIndex: 1,
                            }}
                          >
                            Copied!
                          </Box>
                        </Box>
                      ),
                      sx: { 
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        pr: 1,
                        '& input': {
                          textAlign: 'center',
                          pr: 5
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setCourseKeyDialog({ open: false, courseKey: '', courseId: null })}
                variant="contained"
              >
                확인
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassList; 