import { toast } from 'react-toastify';

/**
 * API 에러 처리를 위한 통합 핸들러
 */

// 에러 타입 정의
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN', 
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// 기본 에러 메시지
const DEFAULT_MESSAGES = {
  [ERROR_TYPES.NETWORK]: '네트워크 연결을 확인해주세요.',
  [ERROR_TYPES.UNAUTHORIZED]: '로그인이 필요합니다.',
  [ERROR_TYPES.FORBIDDEN]: '접근 권한이 없습니다.',
  [ERROR_TYPES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_TYPES.VALIDATION]: '입력 정보를 확인해주세요.',
  [ERROR_TYPES.SERVER]: '서버에 오류가 발생했습니다.',
  [ERROR_TYPES.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
};

/**
 * HTTP 상태 코드를 에러 타입으로 변환
 */
export const getErrorType = (status) => {
  if (!status) return ERROR_TYPES.NETWORK;
  
  switch (status) {
    case 401:
      return ERROR_TYPES.UNAUTHORIZED;
    case 403:
      return ERROR_TYPES.FORBIDDEN;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 422:
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 500:
    case 502:
    case 503:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * 에러 객체에서 사용자에게 보여줄 메시지 추출
 */
export const getErrorMessage = (error, fallbackMessage = null) => {
  // 서버에서 제공한 메시지가 있으면 우선 사용
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // 에러 타입별 기본 메시지
  const errorType = getErrorType(error?.response?.status);
  const defaultMessage = DEFAULT_MESSAGES[errorType];
  
  // 폴백 메시지가 있으면 사용, 없으면 기본 메시지
  return fallbackMessage || defaultMessage;
};

/**
 * 토스트로 에러 메시지 표시
 */
export const showErrorToast = (error, customMessage = null) => {
  const message = getErrorMessage(error, customMessage);
  const errorType = getErrorType(error?.response?.status);
  
  // 에러 타입별 토스트 스타일
  const toastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  switch (errorType) {
    case ERROR_TYPES.UNAUTHORIZED:
      toast.error(message, {
        ...toastOptions,
        autoClose: 3000,
      });
      break;
    case ERROR_TYPES.VALIDATION:
      toast.warning(message, toastOptions);
      break;
    default:
      toast.error(message, toastOptions);
  }
};

/**
 * API 응답 처리 헬퍼
 */
export const handleApiResponse = async (apiCall, options = {}) => {
  const {
    showToast = true,
    customErrorMessage = null,
    onError = null,
    transformData = (data) => data
  } = options;

  try {
    const response = await apiCall();
    return transformData(response.data);
  } catch (error) {
    console.error('API Error:', error);
    
    // 커스텀 에러 핸들러가 있으면 실행
    if (onError && typeof onError === 'function') {
      onError(error);
    }
    
    // 토스트 표시 여부 확인
    if (showToast) {
      showErrorToast(error, customErrorMessage);
    }
    
    // 에러 재발생 (컴포넌트에서 추가 처리 가능)
    throw error;
  }
};

/**
 * 로딩 상태와 함께 API 호출 처리
 */
export const handleApiWithLoading = async (apiCall, setLoading, options = {}) => {
  setLoading(true);
  try {
    const result = await handleApiResponse(apiCall, options);
    return result;
  } finally {
    setLoading(false);
  }
};

export default {
  ERROR_TYPES,
  getErrorType,
  getErrorMessage,
  showErrorToast,
  handleApiResponse,
  handleApiWithLoading
}; 