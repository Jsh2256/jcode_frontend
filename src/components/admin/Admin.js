import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Fade,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { createStringSort } from '../../utils/sortHelpers';

const Admin = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    studentNum: '',
    courseName: '',
    courseCode: '',
    term: '',
    year: new Date().getFullYear(),
    professor: '',
    clss: ''
  });
  const [sort, setSort] = useState({
    field: 'name',
    order: 'asc'
  });
  const [users, setUsers] = useState({
    professors: [],
    assistants: [],
    students: [],
    courses: []
  });
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || '',
        studentNum: selectedItem.studentId || '',
        courseName: selectedItem.courseName || '',
        courseCode: selectedItem.courseCode || '',
        term: selectedItem.term || '',
        year: selectedItem.year || new Date().getFullYear(),
        professor: selectedItem.professor || '',
        clss: selectedItem.clss || ''
      });
    } else {
      setFormData({
        name: '',
        studentNum: '',
        courseName: '',
        courseCode: '',
        term: '',
        year: new Date().getFullYear(),
        professor: '',
        clss: ''
      });
    }
  }, [selectedItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (currentTab === 3) { // 수업 관리 탭
        if (!formData.courseName || !formData.courseCode || !formData.term || !formData.year || !formData.professor || !formData.clss) {
          toast.error('모든 필드를 입력해주세요.');
          return;
        }

        if (dialogType === 'edit') {
          await api.put(`/api/courses/${selectedItem.courseId}`, {
            name: formData.courseName,
            code: formData.courseCode,
            term: formData.term,
            year: formData.year,
            professor: formData.professor,
            clss: formData.clss
          });
          toast.success('수업 정보가 수정되었습니다.');
        } else if (dialogType === 'add') {
          await api.post('/api/courses', {
            name: formData.courseName,
            code: formData.courseCode,
            term: formData.term,
            year: formData.year,
            professor: formData.professor,
            clss: formData.clss
          });
          toast.success('수업이 추가되었습니다.');
          setFormData({
            name: '',
            studentNum: '',
            courseName: '',
            courseCode: '',
            term: '',
            year: new Date().getFullYear(),
            professor: '',
            clss: ''
          });
        }
        fetchCourses();
      } else {
        if (!formData.name || !formData.studentNum) {
          toast.error('모든 필드를 입력해주세요.');
          return;
        }

        if (dialogType === 'edit') {
          await api.put(`/api/users/${selectedItem.id}`, {
            name: formData.name,
            studentNum: formData.studentNum
          });
          toast.success('사용자 정보가 수정되었습니다.');
        } else if (dialogType === 'add') {
          // 추가 로직은 여기에 구현
        }

        fetchUsers();
      }

      handleCloseDialog();
    } catch (error) {
      console.error('작업 실패:', error);
      toast.error('작업 수행에 실패했습니다.');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      
      if (!Array.isArray(response.data)) {
        toast.error('사용자 목록을 불러오는데 실패했습니다.');
        return;
      }
      
      const categorizedUsers = response.data.reduce((acc, user) => {
        const userData = {
          id: user.userId,
          name: user.name,
          studentId: user.studentNum?.toString() || '-',
          email: user.email,
          role: user.role
        };

        switch (user.role) {
          case 'PROFESSOR':
            acc.professors.push(userData);
            break;
          case 'ASSISTANT':
            acc.assistants.push(userData);
            break;
          case 'STUDENT':
            acc.students.push(userData);
            break;
          default:
            break;
        }
        return acc;
      }, {
        professors: [],
        assistants: [],
        students: [],
        courses: []
      });

      setUsers(prev => ({
        ...categorizedUsers,
        courses: prev.courses || []
      }));
    } catch (error) {
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      if (Array.isArray(response.data)) {
        const coursesData = response.data.map(course => ({
          courseId: course.courseId,
          courseName: course.name,
          courseCode: course.code,
          professor: course.professor || '-',
          term: course.term,
          year: course.year,
          clss: course.clss
        }));

        setUsers(prev => ({
          ...prev,
          courses: coursesData
        }));
      } else {
        setUsers(prev => ({
          ...prev,
          courses: []
        }));
      }
    } catch (error) {
      toast.error('수업 목록을 불러오는데 실패했습니다.');
      setUsers(prev => ({
        ...prev,
        courses: []
      }));
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // 다이얼로그 열기
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    // 폼 데이터 초기화
    setFormData({
      name: '',
      studentNum: '',
      courseName: '',
      courseCode: '',
      term: '',
      year: new Date().getFullYear(),
      professor: '',
      clss: ''
    });
  };

  // 사용자 및 수업 삭제 핸들러
  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('jwt');
      if (!token) {
        toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      if (currentTab === 3) {
        // 수업 삭제
        await api.delete(`/api/courses/${selectedItem.courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success(`${selectedItem.courseName} (${selectedItem.courseCode}) 수업이 삭제되었습니다.`);
        fetchCourses();
      } else {
        // 사용자 삭제
        await api.delete(`/api/users/${selectedItem.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success(`${selectedItem.name} (${selectedItem.email}) 사용자가 삭제되었습니다.`);
        fetchUsers();
      }

      handleCloseDialog();
    } catch (error) {
      console.error('삭제 실패:', error);
      
      const errorMessage = error.response?.status === 404 ? 
        (currentTab === 3 ? "존재하지 않는 수업입니다." : "존재하지 않는 사용자입니다.") :
        error.response?.status === 403 ? "삭제 권한이 없습니다." :
        (currentTab === 3 ? "수업 삭제 중 오류가 발생했습니다." : "사용자 삭제 중 오류가 발생했습니다.");

      toast.error(errorMessage);
    }
  };

  // 정렬 토글 함수
  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // 필터링 및 정렬된 사용자 목록 반환
  const getFilteredAndSortedUsers = (items) => {
    if (!items) return [];

    const isCourseTab = currentTab === 3;

    const filtered = items.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      if (isCourseTab) {
        return (
          item.courseName?.toLowerCase().includes(searchLower) ||
          item.courseCode?.toLowerCase().includes(searchLower) ||
          item.professor?.toLowerCase().includes(searchLower) ||
          String(item.year).includes(searchLower) ||
          String(item.term).includes(searchLower)
        );
      }
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        (item.studentId && item.studentId.toLowerCase().includes(searchLower))
      );
    });

    return filtered.sort((a, b) => {
      if (isCourseTab) {
        // 수업 테이블의 숫자 필드들
        const numberFields = ['year', 'term', 'clss'];
        if (numberFields.includes(sort.field)) {
          const aValue = Number(a[sort.field]) || 0;
          const bValue = Number(b[sort.field]) || 0;
          return sort.order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // 수업 테이블의 문자열 필드들
        const fieldMapping = {
          'name': 'courseName',
          'code': 'courseCode'
        };
        const fieldToSort = fieldMapping[sort.field] || sort.field;
        const sortFunction = createStringSort(fieldToSort, sort.order === 'asc');
        return sortFunction(a, b);
      }

      // 일반 사용자 테이블
      const fieldToSort = sort.field === 'studentId' ? 'studentId' : sort.field;
      const sortFunction = createStringSort(fieldToSort, sort.order === 'asc');
      return sortFunction(a, b);
    });
  };

  // 각 섹션별 데이터
  const sections = {
    professors: {
      title: '교수 관리',
      items: users.professors
    },
    assistants: {
      title: '조교 관리',
      items: users.assistants
    },
    students: {
      title: '학생 관리',
      items: users.students
    },
    courses: {
      title: '수업 관리',
      items: users.courses
    }
  };

  // 관리 테이블 렌더링
  const renderTable = (section) => {
    const columns = {
      professors: [
        { id: 'name', label: '이름' },
        { id: 'studentId', label: '학번/교번' },
        { id: 'email', label: '이메일' },
        { id: 'role', label: '역할' }
      ],
      assistants: [
        { id: 'name', label: '이름' },
        { id: 'studentId', label: '학번/교번' },
        { id: 'email', label: '이메일' },
        { id: 'role', label: '역할' }
      ],
      students: [
        { id: 'name', label: '이름' },
        { id: 'studentId', label: '학번/교번' },
        { id: 'email', label: '이메일' },
        { id: 'role', label: '역할' }
      ],
      courses: [
        { id: 'courseName', label: '수업명' },
        { id: 'courseCode', label: '수업 코드' },
        { id: 'professor', label: '담당 교수' },
        { id: 'year', label: '년도' },
        { id: 'term', label: '학기' },
        { id: 'clss', label: '분반' }
      ]
    };

    const sectionKey = Object.keys(sections)[currentTab];

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={currentTab === 3 ? "수업명, 수업 코드, 담당 교수로 검색" : "이름, 이메일, 학번으로 검색"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
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
                {columns[sectionKey].map((column) => (
                  <TableCell 
                    key={column.id}
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    {column.label}
                    {column.id !== 'role' && (
                      <IconButton size="small" onClick={() => toggleSort(column.id)} sx={{ ml: 1 }}>
                        <Box sx={{ 
                          transform: sort.field !== column.id ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                          transition: 'transform 0.2s ease-in-out',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <KeyboardArrowDownIcon fontSize="small" />
                        </Box>
                      </IconButton>
                    )}
                  </TableCell>
                ))}
                <TableCell sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontWeight: 600
                }}>
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAndSortedUsers(section.items).map((item) => (
                <TableRow 
                  key={currentTab === 3 ? item.courseId : item.id}
                >
                  {currentTab === 3 ? (
                    <>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.courseName}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.courseCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.professor}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.year}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.term}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.clss}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.studentId}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        {item.email}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                        <Select
                          size="small"
                          value={item.role || 'STUDENT'}
                          onChange={(e) => handleRoleChange(item.id, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="STUDENT">학생</MenuItem>
                          <MenuItem value="ASSISTANT">조교</MenuItem>
                          <MenuItem value="PROFESSOR">교수</MenuItem>
                        </Select>
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog('edit', item);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog('delete', item);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {getFilteredAndSortedUsers(section.items).length === 0 && (
          <Typography 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}
          >
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 데이터가 없습니다.'}
          </Typography>
        )}
      </>
    );
  };

  // 역할 변경 핸들러 추가
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}/role`, {
        newRole: newRole
      });
      
      toast.success('사용자 역할이 변경되었습니다.');
      fetchUsers(); // 사용자 목록 새로고침
    } catch (error) {
      console.error('역할 변경 실패:', error);
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  // 다이얼로그 렌더링
  const renderDialog = () => {
    const sectionKey = Object.keys(sections)[currentTab];
    const section = sections[sectionKey];

    if (!openDialog) return null;

    return (
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
          {dialogType === 'add' ? `${section.title} 추가` :
           dialogType === 'edit' ? `${section.title} 수정` :
           `${section.title} 삭제`}
        </DialogTitle>
        <DialogContent>
          {dialogType !== 'delete' ? (
            <Box sx={{ pt: 2 }}>
              {currentTab === 3 ? (
                // 수업 관리 폼
                <>
                  <TextField
                    fullWidth
                    name="courseName"
                    label="수업명"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="professor"
                    label="교수명"
                    value={formData.professor}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="courseCode"
                    label="수업 코드"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="term-label" sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      '&.MuiInputLabel-shrink': {
                        backgroundColor: 'transparent'
                      }
                    }}>학기</InputLabel>
                    <Select
                      labelId="term-label"
                      label="학기"
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      required
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                      }}
                    >
                      <MenuItem value="1">1학기</MenuItem>
                      <MenuItem value="2">2학기</MenuItem>
                      <MenuItem value="S">여름학기</MenuItem>
                      <MenuItem value="W">겨울학기</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    name="year"
                    label="년도"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    inputProps={{ 
                      min: 2000,
                      max: new Date().getFullYear() + 1
                    }}
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="clss"
                    label="분반"
                    type="number"
                    value={formData.clss}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 1 }}
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                </>
              ) : (
                // 기존 사용자 관리 폼
                <>
                  <TextField
                    fullWidth
                    name="name"
                    label="이름"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="studentNum"
                    label={sectionKey === 'professors' ? '교번' : '학번'}
                    value={formData.studentNum}
                    onChange={handleInputChange}
                    required
                    type="number"
                    InputProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                    }}
                  />
                </>
              )}
            </Box>
          ) : (
            <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              {currentTab === 3 ? 
                `${selectedItem.courseName} (${selectedItem.courseCode}) 수업을 삭제하시겠습니까?` :
                `${selectedItem.name} (${selectedItem.email}) 사용자를 삭제하시겠습니까?`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            취소
          </Button>
          <Button 
            onClick={dialogType === 'delete' ? handleDelete : handleSubmit}
            variant="contained"
            color={dialogType === 'delete' ? 'error' : 'primary'}
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            {dialogType === 'add' ? '추가' :
             dialogType === 'edit' ? '수정' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {Object.values(sections).map((section) => (
                <Tab
                  key={section.title}
                  label={section.title}
                  sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              {sections[Object.keys(sections)[currentTab]].title}
            </Typography>
          </Box>

          <Card
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
              borderRadius: '12px'
            }}
          >
            <CardContent>
              {renderTable(sections[Object.keys(sections)[currentTab]])}
            </CardContent>
          </Card>
        </Paper>
        {renderDialog()}
      </Container>
    </Fade>
  );
};

export default Admin; 