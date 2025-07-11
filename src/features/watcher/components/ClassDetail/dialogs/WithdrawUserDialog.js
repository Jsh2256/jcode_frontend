import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField
} from '@mui/material';
import { FONT_FAMILY } from '../../../../../constants/uiConstants';

/**
 * 사용자 탈퇴 확인 다이얼로그 컴포넌트
 */
const WithdrawUserDialog = ({ 
  open, 
  onClose, 
  onWithdrawUser, 
  user = null 
}) => {
  const [confirmText, setConfirmText] = useState('');

  // 다이얼로그가 열릴 때마다 confirmText 초기화
  useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);
  
  // 다이얼로그 닫기
  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  // 사용자 탈퇴 처리
  const handleWithdrawUser = async () => {
    if (confirmText !== '사용자를 탈퇴시키겠습니다') {
      return; // 확인 문구가 일치하지 않으면 처리하지 않음
    }

    try {
      await onWithdrawUser({
        userId: user?.userId,
        userName: user?.name,
        confirmText
      });
      handleClose();
    } catch (error) {
      console.error('사용자 탈퇴 실패:', error);
    }
  };

  // 확인 문구 유효성 검사
  const isConfirmTextValid = confirmText === '사용자를 탈퇴시키겠습니다';
  const hasError = confirmText !== '' && !isConfirmTextValid;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        fontFamily: FONT_FAMILY,
        color: '#f44336'
      }}>
        사용자 탈퇴 확인
      </DialogTitle>
      
      <DialogContent>
        <Typography sx={{ mt: 2, mb: 2 }} color="error">
          ⚠️ 주의: 사용자 탈퇴 시 다음 사항을 확인해주세요
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • 해당 사용자의 모든 강의 데이터와 제출물이 삭제됩니다.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • 삭제된 데이터는 복구가 불가능합니다.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          • 재참가 시 새로운 참가 코드가 필요합니다.
        </Typography>
        
        <Typography sx={{ mb: 2 }}>
          정말로 <strong>{user?.name}</strong> 님을 강의에서 탈퇴시키겠습니까?
        </Typography>

        <TextField
          fullWidth
          label="확인을 위해 '사용자를 탈퇴시키겠습니다'를 입력하세요"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          error={hasError}
          helperText={hasError ? '정확한 문구를 입력해주세요' : ''}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      
      <DialogActions>
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
          onClick={handleWithdrawUser}
          variant="contained"
          color="error"
          size="small"
          disabled={!isConfirmTextValid}
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
          탈퇴
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawUserDialog; 