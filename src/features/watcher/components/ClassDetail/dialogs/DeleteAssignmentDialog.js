import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { FONT_FAMILY } from '../../../../../constants/uiConstants';

/**
 * 과제 삭제 확인 다이얼로그 컴포넌트
 */
const DeleteAssignmentDialog = ({ 
  open, 
  onClose, 
  onDeleteAssignment, 
  assignment = null 
}) => {
  
  // 다이얼로그 닫기
  const handleClose = () => {
    onClose();
  };

  // 과제 삭제 처리
  const handleDeleteAssignment = async () => {
    try {
      await onDeleteAssignment(assignment);
      handleClose();
    } catch (error) {
      console.error('과제 삭제 실패:', error);
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
        과제 삭제 확인
      </DialogTitle>
      
      <DialogContent>
        <Typography sx={{ fontFamily: FONT_FAMILY }}>
          정말로 "{assignment?.assignmentName}" 과제를 삭제하시겠습니까?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </Typography>
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
          onClick={handleDeleteAssignment}
          variant="contained"
          color="error"
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
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAssignmentDialog; 