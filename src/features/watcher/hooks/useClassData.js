import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import { createStringSort } from '../../../utils/sortHelpers';

/**
 * 클래스 데이터 관리 커스텀 훅
 * @param {string} courseId - 강의 ID (선택사항)
 */
export const useClassData = (courseId) => {
  const { user } = useAuth();
  const [data, setData] = useState({
    classes: [],
    course: null,
    students: [],
    assignments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({
    field: 'email',
    order: 'asc'
  });

  // 클래스 목록 로드
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      
      if (user?.role === 'ADMIN') {
        response = await api.get('/api/courses');
      } else if (user?.role === 'ASSISTANT') {
        response = await api.get('/api/users/me/assistant/courses');
      } else {
        response = await api.get('/api/users/me/courses');
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
      
      setData(prev => ({
        ...prev,
        classes: formattedData
      }));

    } catch (error) {
      setError('수업 목록을 불러오는데 실패했습니다.');
      console.error('클래스 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 특정 강의 상세 정보 로드
  const loadCourseDetails = useCallback(async (targetCourseId) => {
    const id = targetCourseId || courseId;
    if (!id) return;

    try {
      setLoading(true);
      setError('');

      let courseData = null;
      let studentsData = [];
      let assignmentsData = [];

      if (user?.role === 'ADMIN') {
        const coursesResponse = await api.get(`/api/courses/${id}/details`);
        courseData = coursesResponse.data;
        assignmentsData = coursesResponse.data.assignments || [];
        
        const studentsResponse = await api.get(`/api/courses/${id}/users`);
        studentsData = studentsResponse.data;
      } else if (user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') {
        const coursesResponse = await api.get('/api/users/me/courses/details');
        courseData = coursesResponse.data.find(c => c.courseId === parseInt(id));
        if (!courseData) {
          throw new Error('강의를 찾을 수 없습니다.');
        }
        assignmentsData = courseData.assignments || [];
        
        const studentsResponse = await api.get(`/api/courses/${id}/users`);
        studentsData = studentsResponse.data;
      } else {
        const coursesResponse = await api.get('/api/users/me/courses/details');
        courseData = coursesResponse.data.find(c => c.courseId === parseInt(id));
        if (!courseData) {
          throw new Error('강의를 찾을 수 없습니다.');
        }
        assignmentsData = courseData.assignments || [];
      }

      setData(prev => ({
        ...prev,
        course: courseData,
        students: studentsData,
        assignments: assignmentsData
      }));

    } catch (error) {
      setError('강의 상세 정보를 불러오는데 실패했습니다.');
      console.error('강의 상세 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  // 필터링 및 정렬된 학생 목록 가져오기
  const getFilteredAndSortedStudents = useCallback((searchQuery = '') => {
    const filtered = data.students.filter(student => {
      const searchLower = searchQuery.toLowerCase();
      const emailMatch = student.email?.toLowerCase().includes(searchLower);
      const nameMatch = student.name?.toLowerCase().includes(searchLower);
      const studentNumMatch = String(student.studentNum || '').toLowerCase().includes(searchLower);
      return emailMatch || nameMatch || studentNumMatch;
    });

    return filtered.sort((a, b) => {
      // 역할 우선순위 정의
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
  }, [data.students, sort]);

  // 정렬 토글
  const toggleSort = useCallback((field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  }, []);

  // 새 강의 추가
  const addClass = useCallback(async (classData) => {
    try {
      const createResponse = await api.post('/api/courses', {
        code: classData.code,
        name: classData.name,
        professor: classData.professor,
        year: classData.year,
        term: classData.term,
        clss: parseInt(classData.clss),
        vnc: classData.vnc
      });

      const { courseId, courseKey } = createResponse.data;

      await api.post('/api/users/me/courses', {
        courseKey: courseKey
      });

      await loadClasses(); // 목록 새로고침

      return { 
        success: true, 
        courseId, 
        courseKey 
      };
    } catch (error) {
      console.error('수업 추가 실패:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }, [loadClasses]);

  // 참가 코드 재발급
  const regenerateCourseKey = useCallback(async (targetCourseId) => {
    try {
      const response = await api.post(`/api/courses/${targetCourseId}/regenerate-key`);
      return { 
        success: true, 
        courseKey: response.data.courseKey 
      };
    } catch (error) {
      console.error('참가 코드 재발급 실패:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }, []);

  // 학생을 조교로 승격
  const promoteToTA = useCallback(async (userId) => {
    try {
      await api.post(`/api/courses/${courseId}/users/${userId}/promote`, {
        role: 'ASSISTANT'
      });
      await loadCourseDetails(); // 데이터 새로고침
      return { success: true };
    } catch (error) {
      console.error('조교 승격 실패:', error);
      return { success: false, error: error.message };
    }
  }, [courseId, loadCourseDetails]);

  // 사용자 강의에서 제외
  const withdrawUser = useCallback(async (userId) => {
    try {
      await api.delete(`/api/courses/${courseId}/users/${userId}`);
      await loadCourseDetails(); // 데이터 새로고침
      return { success: true };
    } catch (error) {
      console.error('사용자 제외 실패:', error);
      return { success: false, error: error.message };
    }
  }, [courseId, loadCourseDetails]);

  // 초기 데이터 로드
  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    } else {
      loadClasses();
    }
  }, [courseId, loadClasses, loadCourseDetails]);

  return {
    data,
    loading,
    error,
    sort,
    loadClasses,
    loadCourseDetails,
    getFilteredAndSortedStudents,
    toggleSort,
    addClass,
    regenerateCourseKey,
    promoteToTA,
    withdrawUser,
    refreshData: courseId ? loadCourseDetails : loadClasses,
    user
  };
}; 