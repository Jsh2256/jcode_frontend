# Watcher 커스텀 훅 가이드

이 폴더는 Watcher 기능과 관련된 커스텀 훅들을 포함합니다. 각 훅은 특정 비즈니스 로직을 캡슐화하여 컴포넌트 간 재사용성을 높이고 관심사의 분리를 달성합니다.

## 훅 목록

### 1. useStudentManagement
학생 목록 관리, 정렬, 필터링, JCode/Watcher 리다이렉트 기능을 제공합니다.

```javascript
import { useStudentManagement } from '../hooks';

const {
  searchQuery,
  sort,
  filteredAndSortedStudents,
  studentCount,
  setSearchQuery,
  toggleSort,
  handleJCodeRedirect,
  handleWatcherRedirect,
  clearSearch,
  resetSort
} = useStudentManagement(students, userRole, isDarkMode);
```

**매개변수:**
- `students`: 학생 목록 배열
- `userRole`: 현재 사용자 역할
- `isDarkMode`: 다크 모드 여부

**주요 기능:**
- 학생 검색 및 필터링
- 이름, 이메일, 학번 기준 정렬
- JCode/Watcher 리다이렉트

### 2. useAssignmentData
과제 정보 로딩 및 관리 기능을 제공합니다.

```javascript
import { useAssignmentData } from '../hooks';

const {
  assignment,
  loading,
  error,
  assignmentName,
  startDate,
  endDate,
  isActive,
  isExpired,
  isUpcoming,
  remainingTime,
  refreshAssignment,
  loadAssignmentData
} = useAssignmentData(courseId, assignmentId);
```

**매개변수:**
- `courseId`: 강의 ID
- `assignmentId`: 과제 ID

**주요 기능:**
- 과제 정보 로딩
- 과제 상태 확인 (활성/만료/예정)
- 남은 시간 계산

### 3. useCourseData
강의 정보 로딩 및 관리 기능을 제공합니다.

```javascript
import { useCourseData } from '../hooks';

const {
  course,
  loading,
  error,
  courseName,
  userRole,
  isActive,
  isExpired,
  isUpcoming,
  coursePeriod,
  canManageCourse,
  canViewStudents,
  canCreateAssignments,
  isStudent,
  refreshCourse,
  loadCourseData
} = useCourseData(courseId);
```

**매개변수:**
- `courseId`: 강의 ID

**주요 기능:**
- 강의 정보 로딩
- 사용자 권한 확인
- 강의 상태 관리

### 4. useChartData
차트 데이터 처리 및 관리 기능을 제공합니다.

```javascript
import { useChartData } from '../hooks';

const {
  chartData,
  selectedStudentData,
  loading,
  error,
  selectedStudent,
  selectedTimeRange,
  totalSizeData,
  changeData,
  statistics,
  loadChartData,
  loadStudentData,
  loadSnapshotData,
  refreshChartData,
  clearSelectedStudent,
  transformTotalSizeData,
  transformChangeData,
  getStudentChartData,
  getAggregatedData
} = useChartData(courseId, assignmentId);
```

**매개변수:**
- `courseId`: 강의 ID
- `assignmentId`: 과제 ID

**주요 기능:**
- 차트 데이터 로딩 및 변환
- 학생별 데이터 필터링
- 스냅샷 데이터 관리
- 통계 데이터 계산

### 5. useLiveUpdate
실시간 업데이트 로직을 관리합니다.

```javascript
import { useLiveUpdate } from '../hooks';

const {
  isActive,
  lastUpdateTime,
  updateCount,
  error,
  isUpdating,
  formattedLastUpdate,
  timeUntilNext,
  updateStatus,
  startLiveUpdate,
  stopLiveUpdate,
  toggleLiveUpdate,
  manualUpdate,
  changeInterval
} = useLiveUpdate(updateFunction, intervalMs, autoStart);
```

**매개변수:**
- `updateFunction`: 업데이트 실행 함수
- `intervalMs`: 업데이트 간격 (밀리초, 기본값: 5000)
- `autoStart`: 자동 시작 여부 (기본값: false)

**주요 기능:**
- 주기적 자동 업데이트
- 수동 업데이트
- 업데이트 상태 추적
- 간격 조정

### 6. useLogData
로그 데이터 관리 기능을 제공합니다.

```javascript
import { useLogData } from '../hooks';

const {
  buildLogs,
  runLogs,
  logAverage,
  snapshotAverage,
  loading,
  error,
  logFilters,
  filteredLogs,
  logStatistics,
  loadBuildLogs,
  loadRunLogs,
  loadLogAverage,
  loadSnapshotAverage,
  loadAllLogData,
  refreshLogs,
  clearLogs,
  toggleLogFilter,
  toggleAllFilters,
  searchLogs,
  getUserLogs,
  getLogsByType
} = useLogData(courseId, assignmentId);
```

**매개변수:**
- `courseId`: 강의 ID
- `assignmentId`: 과제 ID

**주요 기능:**
- 빌드/실행 로그 관리
- 로그 필터링
- 로그 검색
- 통계 계산

## 사용 예시

### AssignmentDetail 컴포넌트에서 여러 훅 조합 사용

```javascript
import React from 'react';
import { 
  useAssignmentData, 
  useCourseData, 
  useStudentManagement, 
  useChartData 
} from '../hooks';

const AssignmentDetail = ({ courseId, assignmentId }) => {
  // 과제 정보
  const { assignment, loading: assignmentLoading } = useAssignmentData(courseId, assignmentId);
  
  // 강의 정보
  const { course, canViewStudents } = useCourseData(courseId);
  
  // 학생 관리 (강의에서 학생 목록 가져온 후)
  const { 
    filteredAndSortedStudents, 
    searchQuery, 
    setSearchQuery,
    toggleSort 
  } = useStudentManagement(course?.students || []);
  
  // 차트 데이터
  const { 
    chartData, 
    loadChartData, 
    statistics 
  } = useChartData(courseId, assignmentId);
  
  // 컴포넌트 로직...
};
```

### AssignmentMonitoring 컴포넌트에서 실시간 업데이트 사용

```javascript
import React from 'react';
import { useLogData, useLiveUpdate, useChartData } from '../hooks';

const AssignmentMonitoring = ({ courseId, assignmentId }) => {
  // 로그 데이터
  const { loadAllLogData, filteredLogs, logFilters, toggleLogFilter } = useLogData(courseId, assignmentId);
  
  // 차트 데이터
  const { loadChartData, refreshChartData } = useChartData(courseId, assignmentId);
  
  // 실시간 업데이트
  const updateFunction = React.useCallback(async () => {
    await Promise.all([
      refreshChartData(),
      loadAllLogData(new Date(Date.now() - 24*60*60*1000), new Date()) // 최근 24시간
    ]);
  }, [refreshChartData, loadAllLogData]);
  
  const { 
    isActive, 
    toggleLiveUpdate, 
    manualUpdate,
    formattedLastUpdate 
  } = useLiveUpdate(updateFunction, 5000, false);
  
  // 컴포넌트 로직...
};
```

## 설계 원칙

1. **단일 책임 원칙**: 각 훅은 하나의 명확한 책임을 가집니다.
2. **재사용성**: 여러 컴포넌트에서 공통으로 사용할 수 있습니다.
3. **타입 안전성**: TypeScript와 호환 가능한 구조입니다.
4. **성능 최적화**: useMemo, useCallback을 적절히 활용합니다.
5. **에러 처리**: 각 훅에서 적절한 에러 핸들링을 제공합니다.

## 의존성

이 훅들은 다음과 같은 의존성을 가집니다:

- React (useState, useEffect, useCallback, useMemo)
- API 함수들 (`../components/charts/api`)
- 인증 컨텍스트 (`../../../contexts/AuthContext`)
- 유틸리티 함수들 (`../../../utils/sortHelpers`)
- react-toastify (알림)

## 향후 개선 사항

1. TypeScript 타입 정의 추가
2. 단위 테스트 작성
3. React Query/SWR과의 통합 고려
4. 추가적인 성능 최적화 