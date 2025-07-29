import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LogDialog = ({ open, onClose, selectedLog }) => {
  const theme = useTheme();
  
  if (!selectedLog) return null;
  
  const isRunLog = selectedLog.type === 'run';
  const title = isRunLog ? '실행 로그 정보' : '빌드 로그 정보';
  const statusText = selectedLog.exit_code === 0 ? '성공' : '실패';
  const statusColor = selectedLog.exit_code === 0 ? 
    (theme.palette.mode === 'dark' ? '#50FA7B' : '#4CAF50') : 
    (theme.palette.mode === 'dark' ? '#FF5555' : '#F44336');
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRunLog ? '▶️' : '🔨'} {title}
          <Chip 
            label={statusText} 
            size="small" 
            sx={{ 
              ml: 1,
              backgroundColor: statusColor,
              color: '#FFF',
              fontWeight: 'bold'
            }} 
          />
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText component="div">
          <Typography variant="subtitle1" gutterBottom>
            <strong>명령어:</strong> {selectedLog.command || '정보 없음'}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>시간:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>종료 코드:</strong> {selectedLog.exit_code}
          </Typography>
          {selectedLog.stdout && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>표준 출력:</strong>
              </Typography>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#282A36' : '#F5F5F5',
                maxHeight: '200px',
                overflow: 'auto' 
              }}>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px'
                }}>
                  {selectedLog.stdout}
                </pre>
              </Paper>
            </Box>
          )}
          {selectedLog.stderr && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>표준 에러:</strong>
              </Typography>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#282A36' : '#F5F5F5',
                maxHeight: '200px',
                overflow: 'auto' 
              }}>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px',
                  color: theme => theme.palette.mode === 'dark' ? '#FF5555' : '#F44336'
                }}>
                  {selectedLog.stderr}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog; 