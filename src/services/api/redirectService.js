import api from '../../api/axios';

/**
 * 리다이렉션 API 서비스
 * 백엔드 API 명세서에 따른 Redirect API 구현
 */

const redirectService = {
  /**
   * Node.js 서버 리다이렉션
   * POST /api/redirect
   */
  redirectToJCode: async (redirectData, options = {}) => {
    if (!redirectData) {
      throw new Error('리다이렉트 데이터가 필요합니다.');
    }

    if (!redirectData.userEmail || !redirectData.courseId) {
      throw new Error('사용자 이메일과 강의 ID가 필요합니다.');
    }

    try {
      console.log('리다이렉트 요청:', {
        userEmail: redirectData.userEmail,
        courseId: redirectData.courseId,
        snapshot: redirectData.snapshot || false
      });

      const response = await api.post('/api/redirect', {
        userEmail: redirectData.userEmail,
        courseId: redirectData.courseId,
        snapshot: redirectData.snapshot || false
      });

      console.log('리다이렉트 응답:', response);

      // 응답에서 URL 찾기 - 여러 가능한 필드 확인
      const redirectUrl = response.data?.url || 
                         response.data?.redirectUrl || 
                         response.data?.targetUrl ||
                         response.request?.responseURL;

      if (redirectUrl) {
        return { 
          url: redirectUrl,
          data: response.data 
        };
      }

      // URL이 없으면 응답 전체를 반환하여 디버깅
      console.warn('리다이렉트 URL을 찾을 수 없음. 응답 전체:', response);
      return { 
        data: response.data,
        headers: response.headers 
      };

    } catch (error) {
      console.error('리다이렉트 API 에러:', error);
      
      if (error.response?.status === 403) {
        throw new Error('JCode 접근 권한이 없습니다. 강의에 등록되어 있는지 확인해주세요.');
      } else if (error.response?.status === 404) {
        throw new Error('해당 강의를 찾을 수 없습니다.');
      }
      
      throw new Error(`JCode 리다이렉트에 실패했습니다: ${error.message}`);
    }
  }
};

export default redirectService; 