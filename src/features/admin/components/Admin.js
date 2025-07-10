import React, { useState, useEffect, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { toast } from 'react-toastify';
import { useTheme } from '../../../contexts/ThemeContext';
import { userService, courseService } from '../../../services/api';

// 새로운 컴포넌트들 import
import UserManagementTab from './UserManagement/UserManagementTab';
import CourseManagementTab from './CourseManagement/CourseManagementTab';
import { useAdminData } from '../hooks';

const Admin = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
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

  const { isDarkMode } = useTheme();
  
  // 데이터 관리 훅 사용
  const { 
    loading, 
    users, 
    fetchUsers, 
    fetchCourses, 
    handleRoleChange 
  } = useAdminData();

  // 탭 섹션 정의
  const sections = useMemo(() => ({
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
  }), [users.professors, users.assistants, users.students, users.courses]);

  // 폼 데이터 초기화
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

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // 다이얼로그 관련 핸들러들
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    try {
      if (currentTab === 3) { // 수업 관리 탭
        if (!formData.courseName || !formData.courseCode || !formData.term || !formData.year || !formData.professor || !formData.clss) {
          toast.error('모든 필드를 입력해주세요.');
          return;
        }

        if (dialogType === 'edit') {
          await courseService.updateCourse(selectedItem.courseId, {
            name: formData.courseName,
            code: formData.courseCode,
            term: formData.term,
            year: formData.year,
            professor: formData.professor,
            clss: formData.clss
          });
        } else if (dialogType === 'add') {
          await courseService.createCourse({
            name: formData.courseName,
            code: formData.courseCode,
            term: formData.term,
            year: formData.year,
            professor: formData.professor,
            clss: formData.clss
          });
        }
        fetchCourses();
      } else {
        if (!formData.name || !formData.studentNum) {
          toast.error('모든 필드를 입력해주세요.');
          return;
        }

        if (dialogType === 'edit') {
          await userService.updateUser(selectedItem.id, {
            name: formData.name,
            studentNum: formData.studentNum
          });
        }
        fetchUsers();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('작업 실패:', error);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    try {
      if (currentTab === 3) {
        await courseService.deleteCourse(selectedItem.courseId);
        toast.success(`${selectedItem.courseName} (${selectedItem.courseCode}) 수업이 삭제되었습니다.`);
        fetchCourses();
      } else {
        await userService.deleteUser(selectedItem.id);
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
                // 사용자 관리 폼
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
                    label={Object.keys(sections)[currentTab] === 'professors' ? '교번' : '학번'}
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

  // 현재 탭에 따른 컴포넌트 렌더링
  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0: // 교수 관리
        return (
          <UserManagementTab
            users={users.professors}
            loading={loading}
            onRoleChange={handleRoleChange}
            onOpenDialog={handleOpenDialog}
            rowsPerPage={10}
          />
        );
      case 1: // 조교 관리
        return (
          <UserManagementTab
            users={users.assistants}
            loading={loading}
            onRoleChange={handleRoleChange}
            onOpenDialog={handleOpenDialog}
            rowsPerPage={10}
          />
        );
      case 2: // 학생 관리
        return (
          <UserManagementTab
            users={users.students}
            loading={loading}
            onRoleChange={handleRoleChange}
            onOpenDialog={handleOpenDialog}
            rowsPerPage={10}
          />
        );
      case 3: // 수업 관리
        return (
          <CourseManagementTab
            courses={users.courses}
            loading={loading}
            isDarkMode={isDarkMode}
            onOpenDialog={handleOpenDialog}
            rowsPerPage={10}
          />
        );
      default:
        return null;
    }
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
              {renderCurrentTab()}
            </CardContent>
          </Card>
        </Paper>
        {renderDialog()}
      </Container>
    </Fade>
  );
};

export default Admin; 