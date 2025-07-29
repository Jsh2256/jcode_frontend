import React, { useState, useMemo } from 'react';
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
  Fade,
  Pagination,
  Paper
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 페이지네이션 계산
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return students.slice(startIndex, endIndex);
  }, [students, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(students.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // 검색어 변경 시 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, students.length]);

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
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
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
        {/* 검색 및 총 인원수 표시 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
            sx={{ width: '300px' }}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: FONT_FAMILY,
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            총 <strong>{students.length}명</strong>
            {searchQuery && (
              <>
                | 검색결과 <strong>{students.length}명</strong>
              </>
            )}
          </Typography>
        </Box>
        
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
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
              {paginatedData.map((student, index) => {
                // 전체 목록에서의 실제 인덱스 계산
                const actualIndex = (currentPage - 1) * itemsPerPage + index;
                return (
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
                      {actualIndex + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT_FAMILY }}>
                      {student.studentNum}
                      {/* 교수 역할 표시 */}
                      {(student.courseRole === 'PROFESSOR' || student.role === 'PROFESSOR') && (
                        <Chip
                          label="교수"
                          size="small"
                          sx={{ 
                            ml: 1,
                            height: '24px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            fontWeight: 'bold',
                            '& .MuiChip-label': {
                              px: 1.5,
                              fontSize: '0.7rem',
                              fontFamily: FONT_FAMILY
                            }
                          }}
                        />
                      )}
                      {/* 조교 역할 표시 */}
                      {(student.courseRole === 'ASSISTANT' || student.role === 'ASSISTANT') && (
                        <Chip
                          label="조교"
                          size="small"
                          sx={{ 
                            ml: 1,
                            height: '24px',
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            fontWeight: 'bold',
                            '& .MuiChip-label': {
                              px: 1.5,
                              fontSize: '0.7rem',
                              fontFamily: FONT_FAMILY
                            }
                          }}
                        />
                      )}
                      {/* 관리자 역할 표시 */}
                      {(student.courseRole === 'ADMIN' || student.role === 'ADMIN') && (
                        <Chip
                          label="관리자"
                          size="small"
                          sx={{ 
                            ml: 1,
                            height: '24px',
                            backgroundColor: '#9c27b0',
                            color: '#fff',
                            fontWeight: 'bold',
                            '& .MuiChip-label': {
                              px: 1.5,
                              fontSize: '0.7rem',
                              fontFamily: FONT_FAMILY
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 및 현재 페이지 정보 */}
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mt: 3,
            px: 1
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: FONT_FAMILY,
                color: 'text.secondary'
              }}
            >
              {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, students.length)} / {students.length}명
            </Typography>
            
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              size="medium"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontFamily: FONT_FAMILY
                }
              }}
            />
          </Box>
        )}

        {students.length === 0 && (
          <Typography 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              fontFamily: FONT_FAMILY
            }}
          >
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default StudentsTab; 