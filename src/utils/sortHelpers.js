/**
 * 정렬 유틸리티 함수들
 */

/**
 * 문자열 기준 정렬 함수 생성기
 * @param {string} field - 정렬할 필드명
 * @param {boolean} ascending - 오름차순 여부
 * @returns {Function} 정렬 함수
 */
export const createStringSort = (field, ascending = true) => {
  return (a, b) => {
    const aValue = String(a[field] || '');
    const bValue = String(b[field] || '');
    
    return ascending 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  };
};

/**
 * 숫자 기준 정렬 함수 생성기
 * @param {string} field - 정렬할 필드명
 * @param {boolean} ascending - 오름차순 여부
 * @returns {Function} 정렬 함수
 */
export const createNumberSort = (field, ascending = true) => {
  return (a, b) => {
    const aValue = Number(a[field] || 0);
    const bValue = Number(b[field] || 0);
    
    return ascending ? aValue - bValue : bValue - aValue;
  };
};

/**
 * 학생 이름으로 정렬
 * @param {Array} data - 정렬할 데이터 배열
 * @param {boolean} ascending - 오름차순 여부
 * @returns {Array} 정렬된 배열
 */
export const sortByName = (data, ascending = true) => {
  return [...data].sort(createStringSort('name', ascending));
};

/**
 * 학번으로 정렬
 * @param {Array} data - 정렬할 데이터 배열
 * @param {boolean} ascending - 오름차순 여부
 * @returns {Array} 정렬된 배열
 */
export const sortByStudentNum = (data, ascending = true) => {
  return [...data].sort(createStringSort('student_num', ascending));
};

/**
 * 변화량으로 정렬 (내림차순이 기본)
 * @param {Array} data - 정렬할 데이터 배열
 * @param {boolean} ascending - 오름차순 여부
 * @returns {Array} 정렬된 배열
 */
export const sortByChanges = (data, ascending = false) => {
  return [...data].sort(createNumberSort('size_change', ascending));
}; 