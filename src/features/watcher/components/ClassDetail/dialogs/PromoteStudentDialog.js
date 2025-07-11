import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Select,
  MenuItem
} from '@mui/material';
import { FONT_FAMILY } from '../../../../../constants/uiConstants';

/**
 * 학생 권한 변경 다이얼로그 컴포넌트
 */
const PromoteStudentDialog = ({ 
  open, 
  onClose, 
  onPromoteStudent, 
  student = null,
  currentUserRole = null
}) => {
  const [promotingStudent, setPromotingStudent] = useState(null);

  // student가 변경될 때마다 promotingStudent 업데이트
  useEffect(() => {
    if (student) {
      setPromotingStudent({
        ...student,
        newRole: student.courseRole || 'STUDENT'
      });
    } else {
      setPromotingStudent(null);
    }
  }, [student]);
  
  // 다이얼로그 닫기
  const handleClose = () => {
    setPromotingStudent(null);
    onClose();
  };

  // 권한 변경 처리
  const handlePromoteStudent = async () => {
    try {
      await onPromoteStudent(promotingStudent);
      handleClose();
    } catch (error) {
      console.error('권한 변경 실패:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        fontFamily: FONT_FAMILY,
        fontSize: '1.25rem',
        py: 3
      }}>
        권한 변경
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ 
            fontFamily: FONT_FAMILY,
            mb: 2 
          }}>
            {promotingStudent?.name}님의 권한을 변경합니다.
          </Typography>
          <Select
            fullWidth
            value={promotingStudent?.newRole || 'STUDENT'}
            onChange={(e) => setPromotingStudent(prev => ({
              ...prev,
              newRole: e.target.value
            }))}
            size="small"
          >
            <MenuItem value="STUDENT">학생</MenuItem>
            <MenuItem value="ASSISTANT">조교</MenuItem>
            {currentUserRole === 'ADMIN' && (
              <MenuItem value="PROFESSOR">교수</MenuItem>
            )}
          </Select>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="small"
          sx={{ 
            fontFamily: FONT_FAMILY,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            minHeight: '28px',
            borderRadius: '14px',
            textTransform: 'none'
          }}
        >
          취소
        </Button>
        <Button
          onClick={handlePromoteStudent}
          variant="contained"
          color="warning"
          size="small"
          sx={{ 
            fontFamily: FONT_FAMILY,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            minHeight: '28px',
            borderRadius: '14px',
            textTransform: 'none'
          }}
        >
          변경
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromoteStudentDialog; 