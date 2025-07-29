import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import CodeIcon from '@mui/icons-material/Code';
import MonitorIcon from '@mui/icons-material/Monitor';

const StudentSelector = ({ 
  open, 
  onClose, 
  student, 
  onJCodeRedirect, 
  onWatcherRedirect
}) => {
  if (!student) return null;
  
  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          background: (theme) => theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
          backgroundImage: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(rgba(66, 66, 77, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(66, 66, 77, 0.2) 1px, transparent 1px)'
            : 'linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
          borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box sx={{ 
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: (theme) => theme.palette.primary.main,
          color: '#FFFFFF',
          mr: 1
        }}>
          <PeopleIcon fontSize="small" />
        </Box>
        학생 활동 보기
        <IconButton 
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            color: (theme) => theme.palette.text.secondary
          }} 
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          pt: 4
        }}>
          <Box sx={{ 
            width: '80px',
            height: '80px',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#44475A' : '#F5F5F5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: (theme) => theme.palette.primary.main,
            fontSize: '2rem',
            fontWeight: 'bold',
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
          }}>
            {student.name ? student.name.charAt(0) : '?'}
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 0.5, 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              fontWeight: 'bold'
            }}
          >
            {student.name}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              mb: 3,
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}
          >
            학번: {student.studentNum || '정보 없음'}
          </Typography>
          
          <Box sx={{ 
            width: '100%', 
            p: 1, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(68, 71, 90, 0.3)' : 'rgba(0, 0, 0, 0.03)',
            borderRadius: '8px',
            mb: 3
          }}>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                textAlign: 'center',
                p: 1,
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }}
            >
              {student.email || '이메일 정보 없음'}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ width: '100%' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
              onClick={() => onJCodeRedirect(student)}
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '0.75rem',
                py: 0.75,
                px: 2,
                minHeight: '32px',
                borderRadius: '16px',
                textTransform: 'none',
                flex: 1,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              JCode
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MonitorIcon sx={{ fontSize: '1rem' }} />}
              onClick={() => onWatcherRedirect(student)}
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '0.75rem',
                py: 0.75,
                px: 2,
                minHeight: '32px',
                borderRadius: '16px',
                textTransform: 'none',
                flex: 1,
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px'
                }
              }}
            >
              Watcher
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSelector; 