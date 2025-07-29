import { useState, useCallback, useMemo } from 'react';

export const useSearch = (data, searchFields, resetPageCallback) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링된 데이터 (메모이제이션)
  const filteredData = useMemo(() => {
    if (!searchQuery || !data.length) return data;

    const searchLower = searchQuery.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        
        // 특별한 필드 처리
        if (field === 'vnc') {
          return (value ? 'o' : 'x').includes(searchLower) ||
                 (value ? '사용' : '미사용').includes(searchLower);
        }
        
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchQuery, searchFields]);

  // 검색어 변경 핸들러 (페이지 초기화 포함)
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    if (resetPageCallback) {
      resetPageCallback();
    }
  }, [resetPageCallback]);

  // 검색어 초기화
  const resetSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    filteredData,
    handleSearchChange,
    resetSearch
  };
}; 