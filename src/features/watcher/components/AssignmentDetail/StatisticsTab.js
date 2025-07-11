import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import SortIcon from '@mui/icons-material/Sort';
import NumbersIcon from '@mui/icons-material/Numbers';
import StudentChart from '../charts/StudentChart';
import DateRangeSelector from '../charts/DateRangeSelector';

const StatisticsTab = ({
  userRole,
  searchQuery,
  onSearchChange,
  chartData,
  onStudentClick,
  startDate,
  endDate,
  rangeStartDate,
  rangeEndDate,
  currentRange,
  onRangeChange,
  onStartDateChange,
  onEndDateChange,
  onFetchData,
  onSortByName,
  onSortByChanges,
  onSortByStudentNum
}) => {
  return (
    <Box sx={{ p: 2 }}>
      {/* 검색 필드 - 학생이 아닌 경우에만 표시 */}
      {userRole !== 'STUDENT' && (
        <TextField
          fullWidth
          size="small"
          placeholder="이름 또는 학번으로 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            mb: 3,
            '& .MuiInputBase-root': {
              borderRadius: '20px',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              fontSize: '0.875rem'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}
      
      {/* 정렬 버튼 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onSortByName}
          startIcon={<SortIcon sx={{ fontSize: '1rem' }} />}
          sx={{ 
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
            textTransform: 'none',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 500,
            px: 1.5
          }}
        >
          이름순
        </Button>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onSortByChanges}
          startIcon={<BarChartIcon sx={{ fontSize: '1rem' }} />}
          sx={{ 
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
            textTransform: 'none',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 500,
            px: 1.5
          }}
        >
          변화량순
        </Button>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onSortByStudentNum}
          startIcon={<NumbersIcon sx={{ fontSize: '1rem' }} />}
          sx={{ 
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
            textTransform: 'none',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 500,
            px: 1.5
          }}
        >
          학번순
        </Button>
      </Box>
      
      {/* 학생 차트 */}
      <StudentChart 
        data={chartData}
        searchQuery={searchQuery}
        userRole={userRole}
        onStudentClick={onStudentClick}
      />
      
      {/* 날짜 범위 선택기 */}
      <DateRangeSelector 
        startDate={startDate}
        endDate={endDate}
        rangeStartDate={rangeStartDate}
        rangeEndDate={rangeEndDate}
        currentRange={currentRange}
        onRangeChange={onRangeChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onFetchData={onFetchData}
      />
    </Box>
  );
};

export default StatisticsTab; 