import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  fetchAssignmentInfo,
  fetchCourseInfo,
  fetchStudents,
  fetchChartDataByTimeRange,
  fetchUserCoursesDetails
} from '../components/charts/api';

/**
 * 과제 데이터 관리 커스텀 훅
 * @param {string} courseId - 강의 ID
 * @param {string} assignmentId - 과제 ID
 */
export const useAssignmentData = (courseId, assignmentId) => {
  const { user } = useAuth();
  const [data, setData] = useState({
    course: null,
    assignment: null,
    students: [],
    chartData: [],
    submissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentCount, setStudentCount] = useState(0);

  // 과제 상세 정보 로드
  const loadAssignmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let courseData = null;
      let assignmentData = null;
      let studentsData = [];

      if (user?.role === 'ADMIN') {
        // 관리자 권한으로 데이터 로드
        try {
          courseData = await fetchCourseInfo(courseId);
        } catch (courseError) {
          console.error('강의 정보 로드 실패:', courseError);
        }

        try {
          const assignmentResponse = await fetchAssignmentInfo(courseId, assignmentId);
          if (Array.isArray(assignmentResponse)) {
            assignmentData = assignmentResponse.find(a => a.assignmentId === parseInt(assignmentId));
          } else {
            assignmentData = assignmentResponse;
          }
        } catch (assignmentError) {
          console.error('과제 정보 로드 실패:', assignmentError);
        }

        try {
          studentsData = await fetchStudents(courseId);
        } catch (studentsError) {
          console.error('학생 목록 로드 실패:', studentsError);
        }

      } else if (user?.role === 'PROFESSOR' || user?.role === 'ASSISTANT') {
        // 교수/조교 권한으로 데이터 로드
        const userCoursesData = await fetchUserCoursesDetails();
        courseData = userCoursesData.find(c => c.courseId === parseInt(courseId));

        if (!courseData) {
          throw new Error('강의를 찾을 수 없습니다.');
        }

        const assignmentResponse = await fetchAssignmentInfo(courseId, assignmentId);
        if (Array.isArray(assignmentResponse)) {
          assignmentData = assignmentResponse.find(a => a.assignmentId === parseInt(assignmentId));
        } else {
          assignmentData = assignmentResponse;
        }

        studentsData = await fetchStudents(courseId);
      } else {
        // 학생 권한으로 데이터 로드
        const userCoursesData = await fetchUserCoursesDetails();
        courseData = userCoursesData.find(c => c.courseId === parseInt(courseId));

        if (!courseData) {
          throw new Error('강의를 찾을 수 없습니다.');
        }

        const assignmentResponse = await fetchAssignmentInfo(courseId, assignmentId);
        if (Array.isArray(assignmentResponse)) {
          assignmentData = assignmentResponse.find(a => a.assignmentId === parseInt(assignmentId));
        } else {
          assignmentData = assignmentResponse;
        }
      }

      setData({
        course: courseData,
        assignment: assignmentData,
        students: studentsData || [],
        chartData: [],
        submissions: studentsData || []
      });

      setStudentCount(studentsData?.length || 0);

    } catch (error) {
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
      console.error('과제 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId, user]);

  // 차트 데이터 로드
  const loadChartData = useCallback(async (startDate, endDate) => {
    try {
      if (!courseId || !assignmentId) return;

      const chartData = await fetchChartDataByTimeRange(
        courseId, 
        assignmentId, 
        startDate, 
        endDate
      );

      setData(prev => ({
        ...prev,
        chartData: chartData || []
      }));

    } catch (error) {
      console.error('차트 데이터 로드 실패:', error);
      setError('차트 데이터를 불러오는데 실패했습니다.');
    }
  }, [courseId, assignmentId]);

  // 과제 생성
  const createAssignment = useCallback(async (assignmentData) => {
    try {
      await api.post(`/api/courses/${courseId}/assignments`, assignmentData);
      await loadAssignmentData(); // 데이터 새로고침
      return { success: true };
    } catch (error) {
      console.error('과제 생성 실패:', error);
      return { success: false, error: error.message };
    }
  }, [courseId, loadAssignmentData]);

  // 과제 수정
  const updateAssignment = useCallback(async (updatedData) => {
    try {
      await api.put(`/api/courses/${courseId}/assignments/${assignmentId}`, updatedData);
      await loadAssignmentData(); // 데이터 새로고침
      return { success: true };
    } catch (error) {
      console.error('과제 수정 실패:', error);
      return { success: false, error: error.message };
    }
  }, [courseId, assignmentId, loadAssignmentData]);

  // 과제 삭제
  const deleteAssignment = useCallback(async () => {
    try {
      await api.delete(`/api/courses/${courseId}/assignments/${assignmentId}`);
      return { success: true };
    } catch (error) {
      console.error('과제 삭제 실패:', error);
      return { success: false, error: error.message };
    }
  }, [courseId, assignmentId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (courseId && assignmentId) {
      loadAssignmentData();
    }
  }, [loadAssignmentData]);

  return {
    data,
    loading,
    error,
    studentCount,
    loadChartData,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refreshData: loadAssignmentData,
    user
  };
}; 