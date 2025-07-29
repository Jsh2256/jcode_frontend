import { useState, useCallback, useMemo } from 'react';

export const usePagination = (data, initialRowsPerPage = 10) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(initialRowsPerPage);

  // 페이지네이션된 데이터 (메모이제이션)
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  // 페이지 초기화 (검색이나 탭 변경 시 사용)
  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  // 총 페이지 수
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // 표시 정보
  const displayInfo = {
    total: data.length,
    showing: paginatedData.length > 0 
      ? `${((page - 1) * rowsPerPage) + 1}-${Math.min(page * rowsPerPage, data.length)}`
      : '0',
    hasMultiplePages: data.length > rowsPerPage
  };

  return {
    page,
    rowsPerPage,
    paginatedData,
    totalPages,
    displayInfo,
    handlePageChange,
    resetPage
  };
}; 