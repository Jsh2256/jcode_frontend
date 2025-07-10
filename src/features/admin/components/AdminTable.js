import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Pagination,
  Stack,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { LoadingSpinner } from '../../../components/ui';

// 공통 스타일 상수
const CELL_STYLE = {
  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
};

const AdminTable = ({ 
  loading,
  columns,
  data,
  sort,
  searchQuery,
  searchPlaceholder,
  paginationInfo,
  onSort,
  onSearchChange,
  onPageChange,
  renderTableRow
}) => {
  if (loading) {
    return <LoadingSpinner minHeight="200px" sx={{ p: 3 }} />;
  }

  return (
    <>
      {/* 검색 바 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={onSearchChange}
          sx={{ 
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

      {/* 테이블 */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  sx={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {column.label}
                  {!['role', 'no', 'vnc'].includes(column.id) && (
                    <IconButton size="small" onClick={() => onSort(column.id)} sx={{ ml: 1 }}>
                      <Box sx={{ 
                        transform: sort.field !== column.id ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                        transition: 'transform 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <KeyboardArrowDownIcon fontSize="small" />
                      </Box>
                    </IconButton>
                  )}
                </TableCell>
              ))}
              <TableCell sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontWeight: 600
              }}>
                관리
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => renderTableRow(item, index))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {paginationInfo.hasMultiplePages && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={paginationInfo.totalPages}
            page={paginationInfo.page}
            onChange={onPageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }
            }}
          />
        </Stack>
      )}
      
      {/* 데이터 정보 */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="body2"
          sx={{ 
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
            color: 'text.secondary'
          }}
        >
          총 {paginationInfo.total}개 항목 중 {paginationInfo.showing}개 표시
        </Typography>
        {searchQuery && (
          <Typography 
            variant="body2"
            sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              color: 'text.secondary'
            }}
          >
            "{searchQuery}" 검색 결과
          </Typography>
        )}
      </Box>

      {paginationInfo.total === 0 && (
        <Typography 
          sx={{ 
            mt: 4, 
            textAlign: 'center',
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
          }}
        >
          {searchQuery ? '검색 결과가 없습니다.' : '등록된 데이터가 없습니다.'}
        </Typography>
      )}
    </>
  );
};

export default memo(AdminTable);

export { CELL_STYLE }; 