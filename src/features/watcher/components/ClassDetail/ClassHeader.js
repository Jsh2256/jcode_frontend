import React from 'react';
import { Box, Typography } from '@mui/material';
import WatcherBreadcrumbs from '../../../../components/common/WatcherBreadcrumbs';
import { FONT_FAMILY } from '../../../../constants/uiConstants';

/**
 * 강의 상세 페이지 헤더 컴포넌트
 * 브레드크럼브와 강의 정보를 표시
 */
const ClassHeader = ({ course, courseId }) => {
  if (!course) {
    return null;
  }

  return (
    <>
      <WatcherBreadcrumbs 
        paths={[
          { 
            text: course.courseName || '로딩중...', 
            to: `/watcher/class/${courseId}` 
          }
        ]} 
      />
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        gap: 2,
        mb: 4 
      }}>
        {/* 강의 정보 */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontFamily: FONT_FAMILY
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: FONT_FAMILY,
              color: 'text.primary'
            }}
          >
            {course.courseName}
          </Typography>
          
          <Box 
            component="span" 
            sx={{ 
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            }}
          >
            {course.courseCode}
          </Box>
          
          <Box 
            component="span"
            sx={{ 
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: (theme) => theme.palette.action.hover
            }}
          >
            {course.courseClss}분반
          </Box>
          
          <Box 
            component="span"
            sx={{ 
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: (theme) => theme.palette.action.hover
            }}
          >
            {course.courseProfessor} 교수님
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ClassHeader; 