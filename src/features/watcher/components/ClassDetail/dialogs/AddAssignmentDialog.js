import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  MenuItem
} from '@mui/material';
import { FONT_FAMILY } from '../../../../../constants/uiConstants';

/**
 * 과제 추가 다이얼로그 컴포넌트
 */
const AddAssignmentDialog = ({ 
  open, 
  onClose, 
  onAddAssignment, 
  existingAssignments = [] 
}) => {
  const [newAssignment, setNewAssignment] = useState({
    assignmentName: '',
    assignmentDescription: '',
    kickoffDate: '',
    deadlineDate: ''
  });

  // 과제 코드 중복 체크 함수
  const isAssignmentCodeExists = (code) => {
    return existingAssignments.some(assignment => 
      assignment.assignmentName === code
    );
  };

  // 폼 초기화
  const resetForm = () => {
    setNewAssignment({
      assignmentName: '',
      assignmentDescription: '',
      kickoffDate: '',
      deadlineDate: ''
    });
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 과제 추가 처리
  const handleAddAssignment = async () => {
    try {
      await onAddAssignment(newAssignment);
      resetForm();
      onClose();
    } catch (error) {
      console.error('과제 추가 실패:', error);
    }
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      newAssignment.assignmentName &&
      newAssignment.assignmentDescription &&
      newAssignment.kickoffDate &&
      newAssignment.deadlineDate &&
      new Date(newAssignment.kickoffDate) < new Date(newAssignment.deadlineDate) &&
      !isAssignmentCodeExists(newAssignment.assignmentName)
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          fontFamily: FONT_FAMILY,
          fontSize: '1.5rem',
          py: 3
        }}
      >
        새 과제 추가
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
          <Typography sx={{ 
            fontFamily: FONT_FAMILY,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box component="span" sx={{ fontWeight: 'bold' }}>주의:</Box> 
            현재 버전에서는 과제코드가 hw1~hw10까지만 지원됩니다.
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="과제코드"
              value={newAssignment.assignmentName}
              onChange={(e) => setNewAssignment({ 
                ...newAssignment, 
                assignmentName: e.target.value 
              })}
              error={isAssignmentCodeExists(newAssignment.assignmentName)}
              helperText={isAssignmentCodeExists(newAssignment.assignmentName) ? 
                "이미 존재하는 과제코드입니다" : ""}
              sx={{ 
                '& .MuiInputBase-root': {
                  height: '56px'
                }
              }}
            >
              {[...Array(10)].map((_, index) => {
                const code = `hw${index + 1}`;
                const exists = isAssignmentCodeExists(code);
                return (
                  <MenuItem 
                    key={index} 
                    value={code}
                    disabled={exists}
                    sx={{
                      color: exists ? 'text.disabled' : 'text.primary',
                      '&.Mui-disabled': {
                        opacity: 0.7,
                      }
                    }}
                  >
                    {code} {exists && '(이미 존재함)'}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="과제명"
              value={newAssignment.assignmentDescription}
              onChange={(e) => setNewAssignment({ 
                ...newAssignment, 
                assignmentDescription: e.target.value 
              })}
              error={!newAssignment.assignmentDescription && newAssignment.assignmentName}
              helperText={!newAssignment.assignmentDescription && newAssignment.assignmentName ? 
                "과제명을 입력해주세요" : ""}
              multiline
              rows={6}
              placeholder="과제명을 입력하세요"
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="시작 일시"
              type="datetime-local"
              value={newAssignment.kickoffDate}
              onChange={(e) => setNewAssignment({ 
                ...newAssignment, 
                kickoffDate: e.target.value 
              })}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 60,
                style: {
                  height: '24px',
                  padding: '12px'
                }
              }}
              error={!newAssignment.kickoffDate && newAssignment.assignmentName}
              helperText={!newAssignment.kickoffDate && newAssignment.assignmentName ? 
                "시작 일시를 선택해주세요" : ""}
              sx={{ 
                '& .MuiInputBase-root': {
                  height: '56px'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="마감 일시"
              type="datetime-local"
              value={newAssignment.deadlineDate}
              onChange={(e) => setNewAssignment({ 
                ...newAssignment, 
                deadlineDate: e.target.value 
              })}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 60,
                style: {
                  height: '24px',
                  padding: '12px'
                }
              }}
              error={
                (!newAssignment.deadlineDate && newAssignment.assignmentName) || 
                (newAssignment.kickoffDate && newAssignment.deadlineDate && 
                new Date(newAssignment.kickoffDate) >= new Date(newAssignment.deadlineDate))
              }
              helperText={
                !newAssignment.deadlineDate && newAssignment.assignmentName ? 
                  "마감 일시를 선택해주세요" : 
                  (newAssignment.kickoffDate && newAssignment.deadlineDate && 
                  new Date(newAssignment.kickoffDate) >= new Date(newAssignment.deadlineDate) ? 
                  "마감일시는 시작일시보다 나중이어야 합니다" : "")
              }
              sx={{ 
                '& .MuiInputBase-root': {
                  height: '56px'
                }
              }}
            />
          </Grid>
        </Grid>
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
          onClick={handleAddAssignment} 
          variant="contained"
          size="small"
          disabled={!isFormValid()}
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
          추가
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAssignmentDialog; 