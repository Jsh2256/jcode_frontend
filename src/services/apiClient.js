import api from '../api/axios';
import { handleApiResponse } from './errorHandler';

/**
 * 확장된 API 클라이언트
 * 기존 axios 인스턴스를 래핑하여 일관된 에러 처리와 응답 변환 제공
 */

class ApiClient {
  constructor() {
    this.client = api;
  }

  /**
   * GET 요청
   */
  async get(url, options = {}) {
    return handleApiResponse(
      () => this.client.get(url, options.config),
      options
    );
  }

  /**
   * POST 요청
   */
  async post(url, data = null, options = {}) {
    return handleApiResponse(
      () => this.client.post(url, data, options.config),
      options
    );
  }

  /**
   * PUT 요청
   */
  async put(url, data = null, options = {}) {
    return handleApiResponse(
      () => this.client.put(url, data, options.config),
      options
    );
  }

  /**
   * DELETE 요청
   */
  async delete(url, options = {}) {
    return handleApiResponse(
      () => this.client.delete(url, options.config),
      options
    );
  }

  /**
   * PATCH 요청
   */
  async patch(url, data = null, options = {}) {
    return handleApiResponse(
      () => this.client.patch(url, data, options.config),
      options
    );
  }

  /**
   * 파라미터가 있는 GET 요청을 위한 헬퍼
   */
  async getWithParams(url, params = {}, options = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.get(fullUrl, options);
  }

  /**
   * 파일 업로드를 위한 헬퍼
   */
  async uploadFile(url, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    const config = {
      ...options.config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options.config?.headers,
      },
    };
    
    return this.post(url, formData, {
      ...options,
      config,
    });
  }

  /**
   * 응답을 특정 형태로 변환하는 헬퍼
   */
  async getAndTransform(url, transformer, options = {}) {
    return this.get(url, {
      ...options,
      transformData: transformer,
    });
  }

  /**
   * 조건부 요청 (데이터가 있을 때만 요청)
   */
  async conditionalRequest(condition, requestFn) {
    if (!condition) {
      return null;
    }
    return requestFn();
  }

  /**
   * 여러 요청을 병렬로 실행
   */
  async parallel(requests) {
    try {
      const promises = requests.map(({ method, url, data, options }) => {
        switch (method.toLowerCase()) {
          case 'get':
            return this.get(url, options);
          case 'post':
            return this.post(url, data, options);
          case 'put':
            return this.put(url, data, options);
          case 'delete':
            return this.delete(url, options);
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      });
      
      return await Promise.all(promises);
    } catch (error) {
      console.error('Parallel request failed:', error);
      throw error;
    }
  }

  /**
   * 재시도 로직이 있는 요청
   */
  async withRetry(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // 마지막 시도가 아니면 대기 후 재시도
        if (attempt < maxRetries) {
          console.warn(`Request failed, retrying in ${delay}ms... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // 지수 백오프
        }
      }
    }
    
    throw lastError;
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();

export default apiClient; 