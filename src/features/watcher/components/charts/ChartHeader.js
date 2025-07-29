import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Divider 
} from '@mui/material';
import RemainingTime from '../common/RemainingTime';

const ChartHeader = ({ student, assignment, course }) => {
  // 데이터가 로딩되었는지 확인
  const hasStudentData = student && Object.keys(student).length > 0;
  const hasAssignmentData = assignment && Object.keys(assignment).length > 0;
  const hasCourseData = course && Object.keys(course).length > 0;
  
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} elevation={1}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
        mb: 2
      }}>
        {hasAssignmentData ? assignment.assignmentName : '과제 정보 로딩 중...'}
      </Typography>
      
      {hasStudentData && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {student.studentNum && (
            <Chip 
              label={`학번: ${student.studentNum}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
          )}
          {student.name && (
            <Chip 
              label={`이름: ${student.name}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
          )}
          {student.email && (
            <Chip 
              label={`이메일: ${student.email}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
          )}
        </Box>
      )}
      
      {hasAssignmentData && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`시작: ${new Date(assignment.startDateTime || assignment.kickoffDate).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}`}
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          />
          <Chip 
            label={`마감: ${new Date(assignment.endDateTime || assignment.deadlineDate).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}`}
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          />
          <RemainingTime deadline={assignment.endDateTime || assignment.deadlineDate} />
        </Box>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {hasCourseData && (
          <Typography variant="body2" color="text.secondary">
            <strong>강의:</strong> {course.courseName}
          </Typography>
        )}
        
        {hasAssignmentData && assignment.assignmentDescription && (
          <Typography variant="body2" color="text.secondary" sx={{ 
            whiteSpace: 'pre-line',
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
          }}>
            <strong>설명:</strong> {assignment.assignmentDescription}
          </Typography>
        )}
        
        {!hasStudentData && !hasAssignmentData && (
          <Typography variant="body2" color="error">
            데이터를 불러오는 중 문제가 발생했습니다. 학생 또는 과제 정보를 찾을 수 없습니다.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ChartHeader; 