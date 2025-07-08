import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { FONT_FAMILY } from '../../constants/uiConstants';

/**
 * 프로젝트 스타일이 적용된 공통 Button 컴포넌트
 * @param {Object} props - MUI Button props
 * @param {React.ReactNode} props.children - 버튼 내용
 * @param {Object} props.sx - 추가 스타일링 (폰트는 자동 적용)
 */
const Button = ({ 
  children, 
  sx = {}, 
  ...props 
}) => {
  const buttonSx = {
    fontFamily: FONT_FAMILY,
    ...sx
  };

  return (
    <MuiButton sx={buttonSx} {...props}>
      {children}
    </MuiButton>
  );
};

export default Button; 