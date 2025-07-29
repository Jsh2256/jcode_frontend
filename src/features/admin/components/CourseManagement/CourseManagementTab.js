import React, { useMemo } from 'react';
import AdminTable from '../AdminTable';
import CourseTableRow from './CourseTableRow';
import { usePagination, useSearch, useSort } from '../../hooks';

const CourseManagementTab = ({ 
  courses, 
  loading, 
  isDarkMode,
  onOpenDialog,
  rowsPerPage = 10
}) => {
  // 컬럼 정의
  const columns = useMemo(() => [
    { id: 'no', label: 'No.' },
    { id: 'courseName', label: '수업명' },
    { id: 'courseCode', label: '수업 코드' },
    { id: 'professor', label: '담당 교수' },
    { id: 'year', label: '년도' },
    { id: 'term', label: '학기' },
    { id: 'clss', label: '분반' },
    { id: 'vnc', label: 'VNC 사용' }
  ], []);

  // 검색 필드 정의
  const searchFields = useMemo(() => [
    'courseName', 'courseCode', 'professor', 'year', 'term', 'clss', 'vnc'
  ], []);

  // 정렬 훅
  const { sort, sortedData, toggleSort } = useSort(courses, 'courseName');

  // 검색 훅
  const { 
    searchQuery, 
    filteredData, 
    handleSearchChange 
  } = useSearch(sortedData, searchFields);

  // 페이지네이션 훅
  const {
    page,
    rowsPerPage: currentRowsPerPage,
    paginatedData,
    totalPages,
    displayInfo,
    handlePageChange,
    resetPage
  } = usePagination(filteredData, rowsPerPage);

  // 검색 핸들러 (페이지 리셋 포함)
  const handleSearch = (e) => {
    handleSearchChange(e);
    resetPage();
  };

  // 테이블 행 렌더링
  const renderTableRow = (item, index) => (
    <CourseTableRow
      key={item.courseId}
      item={item}
      itemIndex={(page - 1) * currentRowsPerPage + index + 1}
      isDarkMode={isDarkMode}
      onOpenDialog={onOpenDialog}
    />
  );

  // 페이지네이션 정보
  const paginationInfo = {
    ...displayInfo,
    page,
    totalPages,
    hasMultiplePages: displayInfo.hasMultiplePages
  };

  return (
    <AdminTable
      loading={loading}
      columns={columns}
      data={paginatedData}
      sort={sort}
      searchQuery={searchQuery}
      searchPlaceholder="수업명, 수업 코드, 담당 교수, VNC 사용여부로 검색"
      paginationInfo={paginationInfo}
      onSort={toggleSort}
      onSearchChange={handleSearch}
      onPageChange={handlePageChange}
      renderTableRow={renderTableRow}
    />
  );
};

export default CourseManagementTab; 