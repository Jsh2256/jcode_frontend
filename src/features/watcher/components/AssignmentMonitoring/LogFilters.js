import React from 'react';
import {
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';

const LogFilters = ({
  showRunLogs,
  onToggleRunLogs,
  showBuildLogs,
  onToggleBuildLogs,
  showSuccessLogs,
  onToggleSuccessLogs,
  showFailLogs,
  onToggleFailLogs
}) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <FormControlLabel
        control={
          <Switch 
            checked={showRunLogs}
            onChange={onToggleRunLogs}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#2E7D32', // 더 진한 녹색
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#2E7D32',
              }
            }}
          />
        }
        label="실행 로그"
      />
      <FormControlLabel
        control={
          <Switch 
            checked={showBuildLogs}
            onChange={onToggleBuildLogs}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#0277BD', // 더 진한 파란색
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#0277BD',
              }
            }}
          />
        }
        label="빌드 로그"
      />
      <FormControlLabel
        control={
          <Switch 
            checked={showSuccessLogs}
            onChange={onToggleSuccessLogs}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#2E7D32', // 더 진한 녹색
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#2E7D32',
              }
            }}
          />
        }
        label="성공 로그"
      />
      <FormControlLabel
        control={
          <Switch 
            checked={showFailLogs}
            onChange={onToggleFailLogs}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#C62828', // 더 진한 빨간색
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#C62828',
              }
            }}
          />
        }
        label="실패 로그"
      />
    </Box>
  );
};

export default LogFilters; 