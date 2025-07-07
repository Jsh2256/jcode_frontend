/**
 * 데이터 포맷팅 유틸리티 함수들
 */

/**
 * 바이트를 읽기 쉬운 형태로 포맷팅
 * @param {number} bytes - 바이트 수
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 포맷된 문자열
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (Math.abs(bytes) >= 1048576) {
    return `${(bytes / 1048576).toFixed(decimals)}MB`;
  } else if (Math.abs(bytes) >= 1024) {
    return `${(bytes / 1024).toFixed(decimals)}KB`;
  }
  return `${Math.round(bytes)}B`;
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {Date|string} date - 포맷할 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 숫자를 천 단위 콤마로 포맷팅
 * @param {number} num - 포맷할 숫자
 * @returns {string} 포맷된 숫자 문자열
 */
export const formatNumber = (num) => {
  return num?.toLocaleString('ko-KR') || '0';
}; 