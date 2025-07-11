import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import MonitorIcon from '@mui/icons-material/Monitor';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const AssignmentStudentsTab = ({
  searchQuery,
  onSearchChange,
  students,
  sort,
  onToggleSort,
  onJCodeRedirect,
  onWatcherRedirect
}) => {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="이메일, 이름, 학번으로 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            mt: 2,
            '& .MuiInputBase-root': {
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '50px', fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                No.
              </TableCell>
              <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
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
              <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
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
              <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
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
              <TableCell align="right" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.userId || student.id || index}>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {student.studentNum || '정보 없음'}
                </TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {student.name || '정보 없음'}
                </TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {student.email || '정보 없음'}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => onJCodeRedirect(student)}
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
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
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MonitorIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => onWatcherRedirect(student)}
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        minHeight: '28px',
                        borderRadius: '14px',
                        textTransform: 'none'
                      }}
                    >
                      Watcher
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    검색 결과가 없거나 학생 목록을 불러오지 못했습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AssignmentStudentsTab; 