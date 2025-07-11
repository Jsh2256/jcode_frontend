import React, { useState, useEffect } from 'react';
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
 * 과제 수정 다이얼로그 컴포넌트
 */
const EditAssignmentDialog = ({ 
  open, 
  onClose, 
  onEditAssignment, 
  assignment = null,
  existingAssignments = [] 
}) => {
  const [editingAssignment, setEditingAssignment] = useState(null);

  // assignment가 변경될 때마다 editingAssignment 업데이트
  useEffect(() => {
    if (assignment) {
      setEditingAssignment({
        ...assignment,
        originalAssignmentName: assignment.assignmentName
      });
    } else {
      setEditingAssignment(null);
    }
  }, [assignment]);

  // 과제 코드 중복 체크 함수
  const isAssignmentCodeExists = (code) => {
    return existingAssignments.some(existingAssignment => 
      existingAssignment.assignmentName === code
    );
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setEditingAssignment(null);
    onClose();
  };

  // 과제 수정 처리
  const handleEditAssignment = async () => {
    try {
      await onEditAssignment(editingAssignment);
      handleClose();
    } catch (error) {
      console.error('과제 수정 실패:', error);
    }
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    if (!editingAssignment) return false;
    
    return (
      editingAssignment.assignmentName &&
      editingAssignment.assignmentDescription &&
      editingAssignment.kickoffDate &&
      editingAssignment.deadlineDate &&
      new Date(editingAssignment.kickoffDate) < new Date(editingAssignment.deadlineDate) &&
      !(isAssignmentCodeExists(editingAssignment.assignmentName) && 
        editingAssignment.assignmentName !== editingAssignment.originalAssignmentName)
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
        과제 수정
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
              value={editingAssignment?.assignmentName || ''}
              onChange={(e) => setEditingAssignment({ 
                ...editingAssignment, 
                assignmentName: e.target.value 
              })}
              error={isAssignmentCodeExists(editingAssignment?.assignmentName) && 
                     editingAssignment?.assignmentName !== editingAssignment?.originalAssignmentName}
              helperText={isAssignmentCodeExists(editingAssignment?.assignmentName) && 
                         editingAssignment?.assignmentName !== editingAssignment?.originalAssignmentName ? 
                "이미 존재하는 과제코드입니다" : ""}
              sx={{ 
                '& .MuiInputBase-root': {
                  height: '56px'
                }
              }}
            >
              {[...Array(10)].map((_, index) => {
                const code = `hw${index + 1}`;
                const exists = isAssignmentCodeExists(code) && code !== editingAssignment?.originalAssignmentName;
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
              value={editingAssignment?.assignmentDescription || ''}
              onChange={(e) => setEditingAssignment({ 
                ...editingAssignment, 
                assignmentDescription: e.target.value 
              })}
              error={!editingAssignment?.assignmentDescription}
              helperText={!editingAssignment?.assignmentDescription ? 
                "과제명을 입력해주세요" : ""}
              multiline
              rows={6}
              placeholder="과제에 대한 설명을 입력하세요"
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="시작 일시"
              type="datetime-local"
              value={editingAssignment?.kickoffDate || ''}
              onChange={(e) => setEditingAssignment({ 
                ...editingAssignment, 
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
              error={!editingAssignment?.kickoffDate}
              helperText={!editingAssignment?.kickoffDate ? 
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
              value={editingAssignment?.deadlineDate || ''}
              onChange={(e) => setEditingAssignment({ 
                ...editingAssignment, 
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
                (!editingAssignment?.deadlineDate) || 
                (editingAssignment?.kickoffDate && editingAssignment?.deadlineDate && 
                new Date(editingAssignment.kickoffDate) >= new Date(editingAssignment.deadlineDate))
              }
              helperText={
                !editingAssignment?.deadlineDate ? 
                  "마감 일시를 선택해주세요" : 
                  (editingAssignment?.kickoffDate && editingAssignment?.deadlineDate && 
                  new Date(editingAssignment.kickoffDate) >= new Date(editingAssignment.deadlineDate) ? 
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
          onClick={handleEditAssignment} 
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
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAssignmentDialog; 