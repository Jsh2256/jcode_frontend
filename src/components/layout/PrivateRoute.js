import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';

const PrivateRoute = ({ roles, children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isProfileSet, setIsProfileSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userData = await userService.getCurrentUser();
        const { studentNum, name } = userData;
        setIsProfileSet(Boolean(studentNum && name));
      } catch (error) {
        setIsProfileSet(false);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      checkProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return null; // 또는 로딩 스피너
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 프로필이 설정되지 않았고, 현재 경로가 profile-setup이 아닌 경우
  if (!isProfileSet && window.location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  // 권한 체크
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute; 