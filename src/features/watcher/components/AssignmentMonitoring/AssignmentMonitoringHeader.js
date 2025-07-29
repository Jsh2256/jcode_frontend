import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import WatcherBreadcrumbs from '../../../../components/common/WatcherBreadcrumbs';
import RemainingTime from '../common/RemainingTime';

// ChartHeader 컴포넌트
const ChartHeader = ({ student, assignment, course }) => {
  // student가 배열인 경우 첫 번째 학생 정보만 사용하도록 처리
  const studentData = Array.isArray(student) ? student[0] : student;
  
  // 데이터가 로딩되었는지 확인
  const hasStudentData = studentData && Object.keys(studentData).length > 0;
  const hasAssignmentData = assignment && Object.keys(assignment).length > 0;
  const hasCourseData = course && Object.keys(course).length > 0;
  
  // 학생 정보 가져오기
  const getStudentId = () => {
    if (!hasStudentData) return null;
    if (studentData.studentNum) return studentData.studentNum;
    if (studentData.studentId) return studentData.studentId;
    if (studentData.id) return studentData.id;
    return null;
  };
  
  const getStudentName = () => {
    if (!hasStudentData) return null;
    if (studentData.name) return studentData.name;
    if (studentData.userName) return studentData.userName;
    return null;
  };
  
  const getStudentEmail = () => {
    if (!hasStudentData) return null;
    if (studentData.email) return studentData.email;
    if (studentData.userEmail) return studentData.userEmail;
    return null;
  };
  
  // 과제 시작일/종료일 가져오기
  const getStartDate = () => {
    if (!hasAssignmentData) return null;
    
    // 속성 우선순위: startDate -> kickoffDate -> startDateTime
    if (assignment.startDate) return assignment.startDate;
    if (assignment.kickoffDate) return assignment.kickoffDate;
    if (assignment.startDateTime) return assignment.startDateTime;
    return null;
  };
  
  const getEndDate = () => {
    if (!hasAssignmentData) return null;
    
    // 속성 우선순위: endDate -> deadlineDate -> endDateTime
    if (assignment.endDate) return assignment.endDate;
    if (assignment.deadlineDate) return assignment.deadlineDate;
    if (assignment.endDateTime) return assignment.endDateTime;
    return null;
  };
  
  // 날짜 및 시간 포맷팅 함수
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '날짜 미정';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '날짜 오류';
      
      // 년-월-일 시:분 형식으로 표시
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24시간제 사용
      });
    } catch (error) {
      //console.error('날짜 변환 오류:', error);
      return '날짜 오류';
    }
  };
  
  const studentId = getStudentId();
  const studentName = getStudentName();
  const studentEmail = getStudentEmail();
  const startDate = getStartDate();
  const endDate = getEndDate();
  
  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={1}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
        mb: 2
      }}>
        {hasAssignmentData ? assignment.assignmentName || assignment.name : '과제 정보 로딩 중...'}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip 
          label={`학번: ${studentId || '로딩중...'}`}
          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
        />
        <Chip 
          label={`이름: ${studentName || '로딩중...'}`}
          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
        />
        <Chip 
          label={`이메일: ${studentEmail || '로딩중...'}`}
          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
        />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {hasCourseData && (
          <Typography variant="body2" color="text.secondary">
            <strong>강의:</strong> {course.courseName}
          </Typography>
        )}
        
        {hasAssignmentData && (
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 3,
            flexWrap: 'wrap' 
          }}>
            <Chip 
              label={`시작: ${new Date(assignment.startDateTime || assignment.kickoffDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
            <Chip 
              label={`마감: ${new Date(assignment.endDateTime || assignment.deadlineDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
            <RemainingTime deadline={assignment.endDateTime || assignment.deadlineDate} />
          </Box>
        )}
        
        {!hasStudentData && !hasAssignmentData && (
          <Typography variant="body2" color="info">
            강의 데이터 로딩 중 입니다.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const AssignmentMonitoringHeader = ({ course, assignment, student, assignmentId, userId }) => {
  return (
    <>
      <WatcherBreadcrumbs 
        paths={[
          { 
            text: course?.courseName || '로딩중...', 
            to: `/watcher/class/${course?.courseId}` 
          },
          { 
            text: assignment?.assignmentName || '로딩중...', 
            to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}` 
          },
          {
            text: student?.name || '학생 모니터링',
            to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}/plotly/${userId}`
          }
        ]} 
      />

      <ChartHeader 
        student={student}
        assignment={assignment}
        course={course}
      />
    </>
  );
};

export default AssignmentMonitoringHeader; 