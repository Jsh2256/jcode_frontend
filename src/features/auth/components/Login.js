import React from 'react';
import { Container, Paper, Button, Typography, Box, Fade, Divider } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import { useTheme } from '../../../contexts/ThemeContext';
import CodeIcon from '@mui/icons-material/Code';

const Login = () => {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <Fade in={true} timeout={300}>
      <Container 
        maxWidth="md" 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 500px)'
        }}
      >
        <Paper 
          elevation={isDarkMode ? 3 : 7} 
          sx={{ 
            p: 5,
            width: '100%',
            maxWidth: 640,
            borderRadius: 2,
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' 
                ? '#282A36' 
                : '#FFFFFF',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #FF79C6, #BD93F9)'
                  : 'linear-gradient(90deg, #004C9C, #0070E0)',
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                position: 'relative'
              }}
            >
              <CodeIcon 
                sx={{ 
                  fontSize: '2.2rem',
                  color: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? '#FF79C6'
                      : '#004C9C',
                  mr: 1
                }} 
              />
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{
                  fontWeight: 700,
                  color: (theme) => theme.palette.text.primary,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  letterSpacing: '-0.02em',
                  fontSize: '2.2rem'
                }}
              >
                JCode
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '1rem',
                mb: 0.5
              }}
            >
              전북대학교 통합계정으로 로그인하세요
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '0.85rem',
                color: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? '#6272A4'
                    : 'text.disabled'
              }}
            >
              JCode에서 프로그래밍의 여정을 시작하세요
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            startIcon={
              <SchoolIcon sx={{ 
                fontSize: '1.3rem',
                color: '#FFFFFF'
              }} />
            }
            onClick={login}
            sx={{ 
              py: 1.8,
              backgroundColor: '#004C9C',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#004C9C',
                boxShadow: 'none'
              }
            }}
          >
            JEduTools 통합 로그인
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{
                color: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? '#6272A4'
                    : 'text.disabled',
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }}
            >
              © {new Date().getFullYear()} JEduTools. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default Login; 