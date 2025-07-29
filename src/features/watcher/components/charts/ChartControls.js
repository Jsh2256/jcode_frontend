import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip
} from '@mui/material';

const ChartControls = ({
  timeUnit,
  handleTimeUnitChange,
  minuteValue,
  handleMinuteChange,
  handleDataRefresh,
  isRefreshing,
  timeUnits
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      gap: 2,
      mb: 2
    }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="time-unit-label">시간 단위</InputLabel>
        <Select
          labelId="time-unit-label"
          id="time-unit"
          value={timeUnit}
          label="시간 단위"
          onChange={handleTimeUnitChange}
        >
          {Object.entries(timeUnits).map(([key, value]) => (
            <MenuItem key={key} value={key}>{value}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {timeUnit === 'minute' && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="minute-value-label">분 간격</InputLabel>
          <Select
            labelId="minute-value-label"
            id="minute-value"
            value={minuteValue}
            label="분 간격"
            onChange={handleMinuteChange}
          >
            <MenuItem value="1">1분</MenuItem>
            <MenuItem value="3">3분</MenuItem>
            <MenuItem value="5">5분</MenuItem>
            <MenuItem value="10">10분</MenuItem>
            <MenuItem value="30">30분</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default ChartControls; 