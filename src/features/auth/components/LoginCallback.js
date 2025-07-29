import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../../../services/api';
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
        console.log('LoginCallback: 토큰 발급 시작');
        const token = await authService.getAccessToken();
        console.log('LoginCallback: 토큰 발급 성공', token?.substring(0, 20) + '...');
        
        const decodedToken = jwtDecode(token);
        console.log('LoginCallback: 토큰 디코딩 성공', { role: decodedToken.role });
        
        if (!decodedToken.role) {
          throw new Error('토큰에 역할 정보가 없습니다');
        }

        console.log('LoginCallback: checkAuth 시작');
        await checkAuth();
        console.log('LoginCallback: checkAuth 성공');

        // 프로필 정보 확인
        console.log('LoginCallback: 사용자 정보 조회 시작');
        const userData = await userService.getCurrentUser();
        console.log('LoginCallback: 사용자 정보 조회 성공', userData);
        
        const { studentNum, name } = userData;
        
        if (!studentNum || !name) {
          console.log('LoginCallback: 프로필 설정 필요', { studentNum, name });
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

        console.log('LoginCallback: 기본 경로로 리다이렉트', decodedToken.role);
        const defaultPath = getDefaultRoute(decodedToken.role);
        console.log('LoginCallback: 네비게이트 경로', defaultPath);
        navigate(defaultPath, { replace: true });
      } catch (error) {
        console.error('LoginCallback: 오류 발생', error);
        toast.error(`로그인 처리 중 오류가 발생했습니다: ${error.message}`);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, []);

  return <div>로그인 처리중...</div>;
}

export default LoginCallback; 