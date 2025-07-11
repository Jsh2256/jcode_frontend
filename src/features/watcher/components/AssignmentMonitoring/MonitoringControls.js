import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChartControls from '../charts/ChartControls';

const MonitoringControls = ({
  timeUnit,
  onTimeUnitChange,
  minuteValue,
  onMinuteChange,
  onDataRefresh,
  isRefreshing,
  timeUnits,
  liveUpdate,
  onToggleLiveUpdate,
  nextUpdateTime,
  lastUpdated
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2,
      flexWrap: 'wrap',
      gap: 1
    }}>
      <ChartControls 
        timeUnit={timeUnit}
        handleTimeUnitChange={onTimeUnitChange}
        minuteValue={minuteValue}
        handleMinuteChange={onMinuteChange}
        handleDataRefresh={onDataRefresh}
        isRefreshing={isRefreshing}
        timeUnits={timeUnits}
      />
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        ml: 'auto'
      }}>
        {liveUpdate && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(189, 147, 249, 0.15)' : 'rgba(98, 114, 164, 0.1)',
            p: '4px 8px',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(189, 147, 249, 0.3)' : 'rgba(98, 114, 164, 0.2)',
          }}>
            <CircularProgress 
              size={16}
              variant={nextUpdateTime < 5 ? "indeterminate" : "determinate"}
              value={(30 - nextUpdateTime) * (100/30)}
              color="primary"
              thickness={6}
            />
            <Typography 
              variant="caption" 
              id="countdown-timer"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: theme => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4',
              }}
            >
              {nextUpdateTime}초 후 갱신
            </Typography>
          </Box>
        )}
        
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </Typography>
        )}
        
        <FormControlLabel
          control={
            <Switch 
              checked={liveUpdate}
              onChange={onToggleLiveUpdate}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              실시간 업데이트
            </Typography>
          }
          sx={{ mr: 0 }}
        />
        
        <Tooltip title="지금 데이터 새로고침">
          <IconButton 
            onClick={() => onDataRefresh(false)} 
            disabled={isRefreshing}
            color="primary"
            size="small"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default MonitoringControls; 