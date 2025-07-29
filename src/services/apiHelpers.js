import api from '../api/axios';
import { handleApiResponse } from './errorHandler';

/**
 * API 호출을 간소화하는 헬퍼 함수들
 * apiClient.js 제거 후 직접 axios 사용을 위한 유틸리티
 */

/**
 * GET 요청 헬퍼 (기본적으로 조용함)
 */
export const apiGet = (url, options = {}) => {
  return handleApiResponse(
    () => api.get(url),
    {
      showToast: false, // 조회는 기본적으로 조용히
      ...options
    }
  );
};

/**
 * POST 요청 헬퍼 (기본적으로 토스트 표시)
 */
export const apiPost = (url, data = null, options = {}) => {
  return handleApiResponse(
    () => api.post(url, data),
    {
      showToast: true, // 생성 작업은 결과 표시
      ...options
    }
  );
};

/**
 * PUT 요청 헬퍼 (기본적으로 토스트 표시)
 */
export const apiPut = (url, data = null, options = {}) => {
  return handleApiResponse(
    () => api.put(url, data),
    {
      showToast: true, // 수정 작업은 결과 표시
      ...options
    }
  );
};

/**
 * DELETE 요청 헬퍼 (기본적으로 토스트 표시)
 */
export const apiDelete = (url, options = {}) => {
  return handleApiResponse(
    () => api.delete(url),
    {
      showToast: true, // 삭제 작업은 결과 표시
      ...options
    }
  );
};

/**
 * 파라미터가 있는 GET 요청 헬퍼
 */
export const apiGetWithParams = (url, params = {}, options = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return apiGet(fullUrl, options);
};

/**
 * 조용한 GET 요청 (검색, 상태 확인 등)
 */
export const apiGetSilent = (url, options = {}) => {
  return apiGet(url, {
    showToast: false,
    ...options
  });
};

/**
 * 병렬 요청 헬퍼
 */
export const apiParallel = async (requests) => {
  try {
    const promises = requests.map(({ method, url, data, options = {} }) => {
      switch (method.toLowerCase()) {
        case 'get':
          return apiGet(url, options);
        case 'post':
          return apiPost(url, data, options);
        case 'put':
          return apiPut(url, data, options);
        case 'delete':
          return apiDelete(url, options);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    });
    
    return await Promise.all(promises);
  } catch (error) {
    console.error('Parallel request failed:', error);
    throw error;
  }
}; 