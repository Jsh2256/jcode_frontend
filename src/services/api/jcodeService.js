import api from '../../api/axios';

/**
 * JCode 관리 API 서비스
 * 백엔드 API 명세서에 따른 JCode Admin API 구현
 */

const jcodeService = {
  /**
   * JCode 생성 및 할당
   * POST /api/courses/{courseId}/jcodes
   */
  createJCode: async (courseId, jcodeData, options = {}) => {
    if (!courseId || !jcodeData) {
      throw new Error('강의 ID와 JCode 데이터가 필요합니다.');
    }

    if (!jcodeData.userEmail) {
      throw new Error('사용자 이메일이 필요합니다.');
    }

    try {
      console.log('JCode 생성 요청:', { courseId, userEmail: jcodeData.userEmail, snapshot: jcodeData.snapshot });
      
      const response = await api.post(`/api/courses/${courseId}/jcodes`, {
        userEmail: jcodeData.userEmail,
        snapshot: jcodeData.snapshot || false
      });

      console.log('JCode 생성 성공:', response.data);
      return response.data;

    } catch (error) {
      console.error('JCode 생성 에러:', error);
      
      if (error.response?.status === 403) {
        // 403 에러는 이미 JCode가 존재하거나 권한 없음을 의미할 수 있음
        console.warn('JCode 생성 실패 (이미 존재하거나 권한 없음):', error.response?.data);
        throw new Error('JCode가 이미 존재하거나 생성 권한이 없습니다.');
      } else if (error.response?.status === 404) {
        throw new Error('해당 강의를 찾을 수 없습니다.');
      }
      
      throw new Error(`JCode 생성에 실패했습니다: ${error.message}`);
    }
  },

  /**
   * JCode 삭제
   * DELETE /api/courses/{courseId}/jcodes
   */
  deleteJCode: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('강의 ID가 필요합니다.');
    }

    try {
      console.log('JCode 삭제 요청:', { courseId });
      
      const response = await api.delete(`/api/courses/${courseId}/jcodes`);

      console.log('JCode 삭제 성공:', response.data);
      return response.data;

    } catch (error) {
      console.error('JCode 삭제 에러:', error);
      
      if (error.response?.status === 403) {
        throw new Error('JCode 삭제 권한이 없습니다.');
      } else if (error.response?.status === 404) {
        throw new Error('삭제할 JCode를 찾을 수 없습니다.');
      }
      
      throw new Error(`JCode 삭제에 실패했습니다: ${error.message}`);
    }
  }
};

export default jcodeService; 