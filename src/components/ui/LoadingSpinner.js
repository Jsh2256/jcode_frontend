import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * 중앙 정렬된 로딩 스피너 컴포넌트
 * @param {Object} props
 * @param {string} props.minHeight - 최소 높이 (기본값: '60vh')
 * @param {Object} props.size - CircularProgress 크기 (기본값: undefined)
 * @param {Object} props.sx - 추가 스타일링
 */
const LoadingSpinner = ({ 
  minHeight = '60vh', 
  size,
  sx = {},
  ...props 
}) => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight={minHeight}
      sx={sx}
      {...props}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner; 