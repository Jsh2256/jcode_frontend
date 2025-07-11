import React from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Button, 
  Stack,
  TextField,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { subHours, subDays, subWeeks } from 'date-fns';

const DateRangeSelector = ({
  startDate,
  endDate,
  rangeStartDate,
  rangeEndDate,
  currentRange,
  onRangeChange,
  onStartDateChange,
  onEndDateChange,
  onFetchData
}) => {
  // 현재 선택된 날짜/시간 문자열 반환
  const getRangeDateTimeString = (date) => {
    if (!date) return '';
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // 빠른 기간 선택 핸들러
  const handleQuickSelect = (duration) => {
    if (!endDate) return;

    // 현재 시점을 기준으로 종료 날짜 설정 (과제 마감일 이내로 제한)
    const now = new Date();
    const newEndDate = endDate && now > endDate ? new Date(endDate) : now;
    let newStartDate;

    // 선택한 기간에 따라 시작 날짜 계산 (현재 시점 기준)
    switch (duration) {
      case 'all': // 전체 기간 선택 추가
        newStartDate = new Date(startDate);
        break;
      case '1h':
        newStartDate = subHours(now, 1);
        break;
      case '6h':
        newStartDate = subHours(now, 6);
        break;
      case '12h':
        newStartDate = subHours(now, 12);
        break;
      case '1d':
        newStartDate = subDays(now, 1);
        break;
      case '3d':
        newStartDate = subDays(now, 3);
        break;
      case '1w':
        newStartDate = subWeeks(now, 1);
        break;
      default:
        return;
    }

    // 시작일이 과제 시작일보다 이전이면 과제 시작일로 조정
    if (startDate && newStartDate < startDate) {
      newStartDate = new Date(startDate);
    }

    // 시작일과 종료일 업데이트
    if (onStartDateChange) onStartDateChange(newStartDate);
    if (onEndDateChange) onEndDateChange(newEndDate);

    // 슬라이더 범위 업데이트
    if (startDate && endDate) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startPosition = ((newStartDate.getTime() - startDate.getTime()) / totalMillis) * 100;
      const endPosition = ((newEndDate.getTime() - startDate.getTime()) / totalMillis) * 100;
      
      if (onRangeChange) {
        onRangeChange(null, [startPosition, endPosition]);
      }
    }
  };

  return (
    <Box sx={{ px: 3, py: 2, mt: -7 }}>
      <Stack spacing={2}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              기간 선택
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={onFetchData}
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 500,
                py: 0.5,
                px: 1.5
              }}
            >
              조회
            </Button>
          </Box>
          
          {/* 빠른 기간 선택 버튼 그룹 추가 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ButtonGroup size="small" aria-label="빠른 기간 선택" sx={{ 
              '& .MuiButton-root': {
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textTransform: 'none',
                fontSize: '0.7rem',
                py: 0.3
              }
            }}>
              <Tooltip title="전체 기간">
                <Button onClick={() => handleQuickSelect('all')}>전체</Button>
              </Tooltip>
              <Tooltip title="최근 1시간">
                <Button onClick={() => handleQuickSelect('1h')}>1시간</Button>
              </Tooltip>
              <Tooltip title="최근 6시간">
                <Button onClick={() => handleQuickSelect('6h')}>6시간</Button>
              </Tooltip>
              <Tooltip title="최근 12시간">
                <Button onClick={() => handleQuickSelect('12h')}>12시간</Button>
              </Tooltip>
              <Tooltip title="최근 1일">
                <Button onClick={() => handleQuickSelect('1d')}>1일</Button>
              </Tooltip>
              <Tooltip title="최근 3일">
                <Button onClick={() => handleQuickSelect('3d')}>3일</Button>
              </Tooltip>
              <Tooltip title="최근 1주일">
                <Button onClick={() => handleQuickSelect('1w')}>1주일</Button>
              </Tooltip>
            </ButtonGroup>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {startDate?.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {getRangeDateTimeString(rangeStartDate)} ~ {getRangeDateTimeString(rangeEndDate)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {endDate?.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2, mb: 3, px: 2 }}>
            <Slider
              value={currentRange}
              onChange={onRangeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => {
                if (!startDate || !endDate) return '';
                const totalMillis = endDate.getTime() - startDate.getTime();
                const currentMillis = totalMillis * (value / 100);
                const currentDate = new Date(startDate.getTime() + currentMillis);
                return currentDate.toLocaleString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              }}
              marks={[
                { value: 0, label: '시작' },
                { value: 50, label: '중간' },
                { value: 100, label: '마감' }
              ]}
              sx={{ 
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem'
                }
              }}
            />
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 3,
            gap: 2 
          }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DateTimePicker
                label="시작 검색 시간"
                value={rangeStartDate}
                onChange={onStartDateChange}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    size="small" 
                    fullWidth
                    sx={{ 
                      '& .MuiInputBase-root': {
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.75rem'
                      },
                      maxWidth: '160px'
                    }}
                  />
                }
                minDateTime={startDate}
                maxDateTime={rangeEndDate}
              />
              <DateTimePicker
                label="종료 검색 시간"
                value={rangeEndDate}
                onChange={onEndDateChange}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    size="small" 
                    fullWidth
                    sx={{ 
                      '& .MuiInputBase-root': {
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.75rem'
                      },
                      maxWidth: '160px'
                    }}
                  />
                }
                minDateTime={rangeStartDate}
                maxDateTime={endDate}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default DateRangeSelector; 