import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  Fade
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../api/axios';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { createStringSort } from '../../../../utils/sortHelpers';
import { LoadingSpinner } from '../../../../components/ui';
import { FONT_FAMILY } from '../../../../constants/uiConstants';
import ClassHeader from './ClassHeader';
import ClassTabs from './ClassTabs';
import StudentsTab from './StudentsTab';
import AssignmentsTab from './AssignmentsTab';
import AddAssignmentDialog from './dialogs/AddAssignmentDialog';
import EditAssignmentDialog from './dialogs/EditAssignmentDialog';
import DeleteAssignmentDialog from './dialogs/DeleteAssignmentDialog';
import PromoteStudentDialog from './dialogs/PromoteStudentDialog';
import WithdrawUserDialog from './dialogs/WithdrawUserDialog';

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

  const handleAddAssignment = async (assignmentData) => {
    try {
      // 사용자 입력 시간을 Date 객체로 변환
      const kickoffDateInput = new Date(assignmentData.kickoffDate);
      const deadlineDateInput = new Date(assignmentData.deadlineDate);
      
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
        ...assignmentData,
        kickoffDate: kickoffDateISO,
        deadlineDate: deadlineDateISO
      });

      const assignmentsResponse = await api.get(`/api/courses/${course.courseId}/assignments`);
      setAssignments(assignmentsResponse.data);
    } catch (error) {
      setError('과제 추가에 실패했습니다.');
      throw error; // AddAssignmentDialog에서 오류를 처리할 수 있도록 다시 throw
    }
  };

  const handleEditAssignment = async (assignmentData) => {
    try {
      // 사용자 입력 시간을 Date 객체로 변환
      const kickoffDateInput = new Date(assignmentData.kickoffDate);
      const deadlineDateInput = new Date(assignmentData.deadlineDate);
      
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
      
      await api.put(`/api/courses/${courseId}/assignments/${assignmentData.assignmentId}`, {
        assignmentName: assignmentData.assignmentName,
        assignmentDescription: assignmentData.assignmentDescription,
        kickoffDate: kickoffDateISO,
        deadlineDate: deadlineDateISO
      });

      const assignmentsResponse = await api.get(`/api/courses/${courseId}/assignments`);
      setAssignments(assignmentsResponse.data);
      
      toast.success('과제가 성공적으로 수정되었습니다.');
    } catch (error) {
      toast.error('과제 수정에 실패했습니다. 다시 시도해주세요.');
      throw error; // EditAssignmentDialog에서 오류를 처리할 수 있도록 다시 throw
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    try {
      await api.delete(`/api/courses/${courseId}/assignments/${assignment.assignmentId}`);
      
      const assignmentsResponse = await api.get(`/api/courses/${courseId}/assignments`);
      setAssignments(assignmentsResponse.data);
      
      toast.success('과제가 성공적으로 삭제되었습니다.');
    } catch (error) {
      toast.error('과제 삭제에 실패했습니다. 다시 시도해주세요.');
      throw error; // DeleteAssignmentDialog에서 오류를 처리할 수 있도록 다시 throw
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

  const handleWithdrawUser = async (withdrawData) => {
    if (withdrawData.confirmText !== '사용자를 탈퇴시키겠습니다') {
      toast.error('정확한 확인 문구를 입력해주세요.');
      return;
    }

    try {
      await api.delete(`/api/users/${withdrawData.userId}/courses/${courseId}`);
      
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
      throw error; // WithdrawUserDialog에서 오류를 처리할 수 있도록 다시 throw
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
            sx={{ fontFamily: FONT_FAMILY }}
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
          <ClassHeader 
            course={course}
            courseId={courseId}
          />

          <ClassTabs
            currentTab={currentTab}
            onTabChange={handleTabChange}
            userRole={user?.role}
          />

          {/* 학생 목록 탭 */}
          {currentTab === 'students' && (
            <StudentsTab
              students={getFilteredAndSortedStudents()}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sort={sort}
              onToggleSort={toggleSort}
              onWithdrawUser={(student) => {
                setWithdrawDialog({
                  open: true,
                  userId: student.userId,
                  userName: student.name,
                  confirmText: ''
                });
              }}
              onPromoteStudent={(student) => {
                setPromotingStudent({
                  ...student,
                  newRole: student.role
                });
                setOpenPromoteDialog(true);
              }}
              userRole={user?.role}
              courseId={courseId}
              isDarkMode={isDarkMode}
            />
          )}

          {/* 과제 관리 탭 */}
          {currentTab === 'assignments' && (
            <AssignmentsTab
              assignments={assignments}
              onAddAssignment={() => setOpenAssignmentDialog(true)}
              onEditAssignment={(formattedAssignment) => {
                setEditingAssignment(formattedAssignment);
                setOpenEditDialog(true);
              }}
              onDeleteAssignment={(assignment) => {
                setDeletingAssignment(assignment);
                setOpenDeleteDialog(true);
              }}
              userRole={user?.role}
              courseId={courseId}
            />
          )}

          <AddAssignmentDialog
            open={openAssignmentDialog}
            onClose={() => setOpenAssignmentDialog(false)}
            onAddAssignment={handleAddAssignment}
            existingAssignments={assignments}
          />

          <EditAssignmentDialog
            open={openEditDialog}
            onClose={() => {
              setOpenEditDialog(false);
              setEditingAssignment(null);
            }}
            onEditAssignment={handleEditAssignment}
            assignment={editingAssignment}
            existingAssignments={assignments}
          />

          <DeleteAssignmentDialog
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setDeletingAssignment(null);
            }}
            onDeleteAssignment={handleDeleteAssignment}
            assignment={deletingAssignment}
          />

          <PromoteStudentDialog
            open={openPromoteDialog}
            onClose={() => {
              setOpenPromoteDialog(false);
              setPromotingStudent(null);
            }}
            onPromoteStudent={handlePromoteToTA}
            student={promotingStudent}
            currentUserRole={user?.role}
          />

          {/* 사용자 탈퇴 다이얼로그 */}
          <WithdrawUserDialog
            open={withdrawDialog.open}
            onClose={() => setWithdrawDialog({ ...withdrawDialog, open: false })}
            onWithdrawUser={handleWithdrawUser}
            user={{
              userId: withdrawDialog.userId,
              name: withdrawDialog.userName
            }}
          />
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassDetail; 