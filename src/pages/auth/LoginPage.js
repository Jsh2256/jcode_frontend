import React from 'react';
import { Box } from '@mui/material';
import { Login } from '../../features/auth';

const LoginPage = () => {
  return (
    <Box sx={{ pt: 10 }}>
      <Login />
    </Box>
  );
};

export default LoginPage; 