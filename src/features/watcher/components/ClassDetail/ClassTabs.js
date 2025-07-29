import React from 'react';
import { Tabs, Tab } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { FONT_FAMILY } from '../../../../constants/uiConstants';

/**
 * 강의 상세 페이지 탭 네비게이션 컴포넌트
 * 학생 탭과 과제 탭 사이를 전환
 */
const ClassTabs = ({ currentTab, onTabChange, userRole }) => {
  
  return (
    <Tabs 
      value={currentTab} 
      onChange={onTabChange}
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 3,
        minHeight: '40px',
        '& .MuiTab-root': {
          minHeight: '40px',
          padding: '6px 16px',
          fontSize: '0.875rem'
        }
      }}
    >
      {/* 관리자, 교수, 조교만 학생 탭 표시 */}
      {(userRole === 'ADMIN' || userRole === 'PROFESSOR' || userRole === 'ASSISTANT') && (
        <Tab 
          icon={<GroupIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
          label="학생" 
          value="students"
          iconPosition="start"
          sx={{ 
            fontFamily: FONT_FAMILY,
            textTransform: 'none',
            minHeight: '40px',
            alignItems: 'center'
          }}
        />
      )}
      
      {/* 모든 사용자가 과제 탭 표시 */}
      <Tab 
        icon={<AssignmentIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
        label="과제" 
        value="assignments"
        iconPosition="start"
        sx={{ 
          fontFamily: FONT_FAMILY,
          textTransform: 'none',
          minHeight: '40px',
          alignItems: 'center'
        }}
      />
    </Tabs>
  );
};

export default ClassTabs; 