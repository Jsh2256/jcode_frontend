import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/api';
import { toast } from 'react-toastify';

export const useAdminData = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({
    professors: [],
    assistants: [],
    students: [],
    courses: []
  });

  // 사용자 데이터 가져오기
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await adminService.getAllUsers();
      
      if (!Array.isArray(users)) {
        toast.error('사용자 목록을 불러오는데 실패했습니다.');
        return;
      }
      
      const categorizedUsers = users.reduce((acc, user) => {
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
      }, { professors: [], assistants: [], students: [] });

      setUsers(prev => ({
        ...prev,
        ...categorizedUsers
      }));
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      // 에러 토스트는 서비스에서 자동 표시됨
    } finally {
      setLoading(false);
    }
  }, []);

  // 수업 데이터 가져오기
  const fetchCourses = useCallback(async () => {
    try {
      const courses = await adminService.getAllCourses();
      
      if (Array.isArray(courses)) {
        setUsers(prev => ({
          ...prev,
          courses: courses.map(course => ({
            courseId: course.courseId,
            courseName: course.name,
            courseCode: course.code,
            term: course.term,
            year: course.year,
            professor: course.professor || '-',
            clss: course.clss || '-',
            vnc: course.vnc
          }))
        }));
      }
    } catch (error) {
      console.error('강의 목록 조회 실패:', error);
      // 에러 토스트는 서비스에서 자동 표시됨
    }
  }, []);

  // 사용자 역할 변경
  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await adminService.changeUserRole(userId, newRole);
      // 성공 토스트는 서비스에서 자동 표시
      fetchUsers(); // 사용자 목록 새로고침
    } catch (error) {
      console.error('역할 변경 실패:', error);
      toast.error('역할 변경에 실패했습니다.');
    }
  }, [fetchUsers]);

  // 데이터 초기 로딩
  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [fetchUsers, fetchCourses]);

  return {
    loading,
    users,
    fetchUsers,
    fetchCourses,
    handleRoleChange
  };
}; 