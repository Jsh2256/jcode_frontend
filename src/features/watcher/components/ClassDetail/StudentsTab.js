import React from 'react';
import {
  Box,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Stack,
  Button,
  Typography,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PeopleIcon from '@mui/icons-material/People';
import CodeIcon from '@mui/icons-material/Code';
import ErrorIcon from '@mui/icons-material/Error';
import { FONT_FAMILY } from '../../../../constants/uiConstants';
import api from '../../../../api/axios';
import { toast } from 'react-toastify';

/**
 * 학생 목록 탭 컴포넌트
 * 학생 검색, 정렬, 관리 기능 제공
 */
const StudentsTab = ({
  students,
  searchQuery,
  onSearchChange,
  sort,
  onToggleSort,
  onWithdrawUser,
  onPromoteStudent,
  userRole,
  courseId,
  isDarkMode
}) => {

  // JCode 연결 처리
  const handleJCodeConnect = async (student) => {
    try {
      // API 요청으로 리다이렉트 URL 가져오기
      const response = await api.post('/api/redirect', {
        userEmail: student.email,
        courseId: courseId
      }, { withCredentials: true });
      
      // 응답에서 최종 URL 추출
      const finalUrl = response.request?.responseURL || response.data?.url;
      
      if (!finalUrl) {
        throw new Error("리다이렉트 URL을 찾을 수 없습니다");
      }
      
      // 새 탭에서 URL 열기
      window.open(finalUrl, '_blank');
      
    } catch (err) {
      // 에러 처리
      toast.error('Web-IDE 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', {
        icon: ({theme, type}) => <ErrorIcon sx={{ color: '#fff', fontSize: '1.5rem', mr: 1 }}/>,
        style: {
          background: isDarkMode ? '#d32f2f' : '#f44336',
          color: '#fff',
          fontFamily: FONT_FAMILY,
          borderRadius: '8px',
          fontSize: '0.95rem',
          padding: '12px 20px',
          maxWidth: '500px',
          width: 'auto',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }
      });
    }
  };

  return (
    <Fade in={true} timeout={300}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            size="small"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: FONT_FAMILY, fontWeight: 'bold', width: '60px' }}>
                  No.
                </TableCell>
                <TableCell sx={{ fontFamily: FONT_FAMILY, fontWeight: 'bold' }}>
                  학번
                  <IconButton size="small" onClick={() => onToggleSort('studentNum')} sx={{ ml: 1 }}>
                    <Box sx={{ 
                      transform: sort.field !== 'studentNum' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                      transition: 'transform 0.2s ease-in-out',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <KeyboardArrowDownIcon fontSize="small" />
                    </Box>
                  </IconButton>
                </TableCell>
                <TableCell sx={{ fontFamily: FONT_FAMILY, fontWeight: 'bold' }}>
                  이름
                  <IconButton size="small" onClick={() => onToggleSort('name')} sx={{ ml: 1 }}>
                    <Box sx={{ 
                      transform: sort.field !== 'name' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                      transition: 'transform 0.2s ease-in-out',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <KeyboardArrowDownIcon fontSize="small" />
                    </Box>
                  </IconButton>
                </TableCell>
                <TableCell sx={{ fontFamily: FONT_FAMILY, fontWeight: 'bold' }}>
                  이메일
                  <IconButton size="small" onClick={() => onToggleSort('email')} sx={{ ml: 1 }}>
                    <Box sx={{ 
                      transform: sort.field !== 'email' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                      transition: 'transform 0.2s ease-in-out',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <KeyboardArrowDownIcon fontSize="small" />
                    </Box>
                  </IconButton>
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: FONT_FAMILY, fontWeight: 'bold' }}>
                  작업
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, index) => (
                <TableRow 
                  key={student.email}
                  sx={{ 
                    transition: 'all 0.3s ease',
                    animation: 'fadeIn 0.3s ease',
                    backgroundColor: theme => {
                      if (student.courseRole === 'PROFESSOR') {
                        return theme.palette.mode === 'dark' 
                          ? 'rgba(76, 175, 80, 0.08)' 
                          : 'rgba(76, 175, 80, 0.05)';
                      } else if (student.courseRole === 'ASSISTANT') {
                        return theme.palette.mode === 'dark' 
                          ? 'rgba(255, 167, 38, 0.08)' 
                          : 'rgba(255, 167, 38, 0.05)';
                      }
                      return 'transparent';
                    },
                    '@keyframes fadeIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(10px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  <TableCell sx={{ fontFamily: FONT_FAMILY, textAlign: 'center' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_FAMILY }}>
                    {student.studentNum}
                    {student.courseRole === 'PROFESSOR' && (
                      <Chip
                        label="교수"
                        size="small"
                        color="success"
                        sx={{ 
                          ml: 1,
                          height: '20px',
                          '& .MuiChip-label': {
                            px: 1,
                            fontSize: '0.625rem'
                          }
                        }}
                      />
                    )}
                    {student.courseRole === 'ASSISTANT' && (
                      <Chip
                        label="조교"
                        size="small"
                        color="warning"
                        sx={{ 
                          ml: 1,
                          height: '20px',
                          '& .MuiChip-label': {
                            px: 1,
                            fontSize: '0.625rem'
                          }
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_FAMILY }}>
                    {student.name}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_FAMILY }}>
                    {student.email}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {(userRole === 'PROFESSOR' || userRole === 'ADMIN') && 
                       student.courseRole !== 'PROFESSOR' && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => onWithdrawUser(student)}
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
                      )}
                      
                      {(userRole === 'PROFESSOR' || userRole === 'ADMIN') && student.courseRole !== 'PROFESSOR' && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PeopleIcon sx={{ fontSize: '1rem' }} />}
                          onClick={() => onPromoteStudent(student)}
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
                          권한 변경
                        </Button>
                      )}
                      
                      {(userRole === 'PROFESSOR' || userRole === 'ADMIN' || userRole === 'ASSISTANT') && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                          onClick={() => handleJCodeConnect(student)}
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
                          JCode
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {students.length === 0 && (
          <Typography 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              fontFamily: FONT_FAMILY
            }}
          >
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default StudentsTab; 