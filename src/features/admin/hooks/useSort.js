import { useState, useCallback, useMemo } from 'react';
import { createStringSort } from '../../../utils/sortHelpers';

export const useSort = (data, initialField = 'name', initialOrder = 'asc') => {
  const [sort, setSort] = useState({
    field: initialField,
    order: initialOrder
  });

  // 정렬된 데이터 (메모이제이션)
  const sortedData = useMemo(() => {
    if (!data.length || !sort.field) return data;

    return [...data].sort((a, b) => {
      // 숫자 필드들 처리
      const numberFields = ['year', 'term', 'clss'];
      if (numberFields.includes(sort.field)) {
        const aValue = Number(a[sort.field]) || 0;
        const bValue = Number(b[sort.field]) || 0;
        return sort.order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 문자열 필드들 처리
      const fieldMapping = {
        'name': 'courseName',
        'code': 'courseCode'
      };
      const fieldToSort = fieldMapping[sort.field] || sort.field;
      const sortFunction = createStringSort(fieldToSort, sort.order === 'asc');
      return sortFunction(a, b);
    });
  }, [data, sort]);

  // 정렬 토글 함수
  const toggleSort = useCallback((field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  }, []);

  // 정렬 초기화
  const resetSort = useCallback(() => {
    setSort({
      field: initialField,
      order: initialOrder
    });
  }, [initialField, initialOrder]);

  return {
    sort,
    sortedData,
    toggleSort,
    resetSort
  };
}; 