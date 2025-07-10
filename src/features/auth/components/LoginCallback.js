import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import { getDefaultRoute } from '../../../routes';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

function LoginCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = await auth.getAccessToken();
        const decodedToken = jwtDecode(token);
        
        if (!decodedToken.role) {
          throw new Error('토큰에 역할 정보가 없습니다');
        }

        await checkAuth();

        // 프로필 정보 확인
        const response = await auth.getUserProfile();
        const { studentNum, name } = response.data;
        
        if (!studentNum || !name) {
          const toastId = 'profile-setup-toast';
          if (!toast.isActive(toastId)) {
            toast.info('학번과 이름 설정이 필요합니다.', {
              toastId,
              autoClose: 2000
            });
          }
          navigate('/profile-setup', { replace: true });
          return;
        }

        const defaultPath = getDefaultRoute(decodedToken.role);
        navigate(defaultPath, { replace: true });
      } catch (error) {
        toast.error('로그인 처리 중 오류가 발생했습니다.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, []);

  return <div>로그인 처리중...</div>;
}

export default LoginCallback; 