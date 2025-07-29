import React, { useMemo } from 'react';
import AdminTable from '../AdminTable';
import UserTableRow from './UserTableRow';
import { usePagination, useSearch, useSort } from '../../hooks';

const UserManagementTab = ({ 
  users, 
  loading, 
  onRoleChange, 
  onOpenDialog,
  rowsPerPage = 10
}) => {
  // 컬럼 정의
  const columns = useMemo(() => [
    { id: 'no', label: 'No.' },
    { id: 'name', label: '이름' },
    { id: 'studentId', label: '학번/교번' },
    { id: 'email', label: '이메일' },
    { id: 'role', label: '역할' }
  ], []);

  // 검색 필드 정의
  const searchFields = useMemo(() => ['name', 'email', 'studentId'], []);

  // 정렬 훅
  const { sort, sortedData, toggleSort } = useSort(users, 'name');

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
    <UserTableRow
      key={item.id}
      item={item}
      itemIndex={(page - 1) * currentRowsPerPage + index + 1}
      onRoleChange={onRoleChange}
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
      searchPlaceholder="이름, 이메일, 학번으로 검색"
      paginationInfo={paginationInfo}
      onSort={toggleSort}
      onSearchChange={handleSearch}
      onPageChange={handlePageChange}
      renderTableRow={renderTableRow}
    />
  );
};

export default UserManagementTab; 