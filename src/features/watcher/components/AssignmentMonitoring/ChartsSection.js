import React from 'react';
import { Box } from '@mui/material';
import TotalSizeChart from '../charts/TotalSizeChart';
import ChangeChart from '../charts/ChangeChart';

const ChartsSection = ({ data, student, assignment, filteredLogs }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <TotalSizeChart 
        data={data} 
        student={student} 
        assignment={assignment}
        runLogs={filteredLogs.runLogs}
        buildLogs={filteredLogs.buildLogs}
      />

      <ChangeChart 
        data={data} 
        student={student} 
        assignment={assignment} 
      />
    </Box>
  );
};

export default ChartsSection; 