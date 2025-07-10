import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { getTheme } from './theme';
import PrivateRoute from './components/layout/PrivateRoute';
import { routes } from './routes';
import { Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginCallback } from './features/auth';
import { getDefaultRoute } from './routes';

const AppRoutes = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* routes.js에 정의된 모든 라우트 사용 */}
      {routes.map(({ path, element: Element, roles }) => (
        <Route
          key={path}
          path={path}
          element={
            roles.length > 0 ? (
              <PrivateRoute roles={roles}>
                <Element />
              </PrivateRoute>
            ) : (
              <Element />
            )
          }
        />
      ))}
      
      {/* 로그인 콜백 라우트 추가 */}
      <Route path="/login/success" element={<LoginCallback />} />

      {/* 정의되지 않은 경로는 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh'
        }}
      >
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            pt: 10,
            pb: 4,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <AppRoutes />
        </Box>
        <Footer />
      </Box>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        limit={1}
        style={{
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
        }}
      />
    </MuiThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
