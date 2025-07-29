import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonitorIcon from '@mui/icons-material/Monitor';
import PeopleIcon from '@mui/icons-material/People';

const AssignmentTabs = ({ tabValue, onTabChange, userRole, studentCount }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={tabValue} 
        onChange={onTabChange}
        sx={{
          '& .MuiTab-root': {
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
            textTransform: 'none',
            minHeight: '48px'
          }
        }}
      >
        <Tab 
          icon={<BarChartIcon />} 
          iconPosition="start" 
          label="전체 통계" 
        />
        {userRole === 'STUDENT' && (
          <Tab 
            icon={<MonitorIcon />} 
            iconPosition="start" 
            label="나의 통계" 
          />
        )}
        {(userRole === 'ADMIN' || userRole === 'PROFESSOR' || userRole === 'ASSISTANT') && (
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start" 
            label={`학생 목록 (${studentCount})`} 
          />
        )}
      </Tabs>
    </Box>
  );
};

export default AssignmentTabs; 