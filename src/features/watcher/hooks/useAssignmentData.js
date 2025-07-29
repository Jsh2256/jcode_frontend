import { useState, useEffect } from 'react';
import { fetchAssignmentInfo } from '../components/charts/api';

export const useAssignmentData = (courseId, assignmentId) => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssignmentData = async () => {
    if (!courseId || !assignmentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
      
      // assignmentData가 배열인지 확인
      if (Array.isArray(assignmentData)) {
        const currentAssignment = assignmentData.find(a => a.assignmentId === parseInt(assignmentId));
        if (!currentAssignment) {
          throw new Error('과제를 찾을 수 없습니다.');
        }
        setAssignment(currentAssignment);
      } else {
        // assignmentData가 배열이 아닌 경우 직접 사용
        setAssignment(assignmentData);
      }
    } catch (err) {
      console.error('과제 정보 로드 실패:', err);
      setError(err.message || '과제 정보를 불러오는데 실패했습니다.');
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  };

  // 과제 정보 새로고침
  const refreshAssignment = () => {
    loadAssignmentData();
  };

  // 과제 날짜 관련 유틸리티 함수들
  const getStartDate = () => {
    if (!assignment) return null;
    
    // 속성 우선순위: startDate -> kickoffDate -> startDateTime
    if (assignment.startDate) return assignment.startDate;
    if (assignment.kickoffDate) return assignment.kickoffDate;
    if (assignment.startDateTime) return assignment.startDateTime;
    return null;
  };

  const getEndDate = () => {
    if (!assignment) return null;
    
    // 속성 우선순위: endDate -> deadlineDate -> endDateTime
    if (assignment.endDate) return assignment.endDate;
    if (assignment.deadlineDate) return assignment.deadlineDate;
    if (assignment.endDateTime) return assignment.endDateTime;
    return null;
  };

  const getAssignmentName = () => {
    if (!assignment) return '로딩중...';
    return assignment.assignmentName || assignment.name || '과제명 없음';
  };

  // 과제 상태 확인
  const isAssignmentActive = () => {
    const startDate = getStartDate();
    const endDate = getEndDate();
    const now = new Date();

    if (!startDate || !endDate) return false;

    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  const isAssignmentExpired = () => {
    const endDate = getEndDate();
    if (!endDate) return false;
    
    return new Date() > new Date(endDate);
  };

  const isAssignmentUpcoming = () => {
    const startDate = getStartDate();
    if (!startDate) return false;
    
    return new Date() < new Date(startDate);
  };

  // 남은 시간 계산
  const getRemainingTime = () => {
    const endDate = getEndDate();
    if (!endDate) return null;

    const now = new Date();
    const deadline = new Date(endDate);
    const timeDiff = deadline - now;

    if (timeDiff <= 0) return { expired: true };

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, expired: false };
  };

  useEffect(() => {
    loadAssignmentData();
  }, [courseId, assignmentId]);

  return {
    // 상태
    assignment,
    loading,
    error,
    
    // 계산된 값
    assignmentName: getAssignmentName(),
    startDate: getStartDate(),
    endDate: getEndDate(),
    isActive: isAssignmentActive(),
    isExpired: isAssignmentExpired(),
    isUpcoming: isAssignmentUpcoming(),
    remainingTime: getRemainingTime(),
    
    // 액션
    refreshAssignment,
    loadAssignmentData
  };
}; 