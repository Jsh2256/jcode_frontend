import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import StudentSelector from './StudentSelector';
import { cleanupChartInstance } from './api';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../api/axios';
import { formatBytes } from '../../../utils/formatters';
import { sortByName, sortByStudentNum, sortByChanges } from '../../../utils/sortHelpers';
import { getChartStyles } from './ChartUtils';

const StudentChart = ({ data, searchQuery, userRole, onStudentClick }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isDarkMode = theme.palette.mode === 'dark';
  const chartRef = useRef(null);
  const plotlyInstance = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [processedData, setProcessedData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 관리자/교수/조교 여부 확인
  const isAdmin = userRole === 'ADMIN';
  const isProfessor = userRole === 'PROFESSOR';
  const isAssistant = userRole === 'ASSISTANT';
  const canViewStudentDetails = isAdmin || isProfessor || isAssistant;

  // 사용자 학번 정보 가져오기
  useEffect(() => {
    if (userRole === 'STUDENT') {
      const fetchCurrentUser = async () => {
        try {
          const response = await api.get('/api/users/me');
          //console.log('현재 로그인한 사용자:', response.data);
          setCurrentUser(response.data);
        } catch (error) {
          //console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        }
      };
      
      fetchCurrentUser();
    }
  }, [userRole]);

  // 초기 데이터 로드 (data prop이 변경될 때마다)
  useEffect(() => {
    if (data && data.length > 0) {
      //.log('초기 데이터 로드 (data prop 변경)', data.length);
      setProcessedData(data);
    }
  }, [data]);

  // 디버깅용 콘솔 로그 추가
  // console.log('StudentChart 렌더링 - 입력 데이터:', data);
  // console.log('StudentChart 검색어:', searchQuery);
  // console.log('StudentChart 사용자 역할:', userRole);

  // getChartStyles는 ChartUtils.js에서 import하여 사용

  // formatBytes는 utils/formatters.js에서 import하여 사용

  // 버튼 클릭 핸들러 - 이름 정렬
  const handleSortByName = useCallback(() => {
    if (processedData.length === 0) return;
    
    const sorted = sortByName(processedData);
    setProcessedData(sorted);
    // 즉시 차트 업데이트
    cleanupChart();
    initPlotly();
  }, [processedData]);

  // 버튼 클릭 핸들러 - 학번 정렬
  const handleSortByStudentNum = useCallback(() => {
    if (processedData.length === 0) return;
    
    const sorted = sortByStudentNum(processedData);
    setProcessedData(sorted);
    // 즉시 차트 업데이트
    cleanupChart();
    initPlotly();
  }, [processedData]);

  // 버튼 클릭 핸들러 - 변화량 정렬
  const handleSortByChanges = useCallback(() => {
    if (processedData.length === 0) return;
    
    const sorted = sortByChanges(processedData); // 기본적으로 내림차순
    setProcessedData(sorted);
    // 즉시 차트 업데이트
    cleanupChart();
    initPlotly();
  }, [processedData]);

  // 데이터 준비
  const prepareChartData = () => {
    // 데이터 확인 로깅
    //console.log('prepareChartData 호출됨, data 길이:', data?.length || 0, 'processedData 길이:', processedData?.length || 0);
    
    // 전체 데이터를 사용 (검색 결과만 하이라이트)
    const currentProcessedData = data || [];
    
    // 처리된 데이터 상태 업데이트
    // - 처음 로드 시 또는 새 데이터를 받았을 때만 상태 업데이트
    if (currentProcessedData.length > 0 && 
        (processedData.length === 0 || 
         JSON.stringify(data) !== JSON.stringify(processedData))) {
      //console.log('processedData 업데이트:', currentProcessedData.length);
      setProcessedData(currentProcessedData);
    }
    
    // 현재 사용할 데이터 선택 (processedData가 있으면 사용, 없으면 원본 data 사용)
    const dataToUse = processedData.length > 0 ? processedData : currentProcessedData;
    
    //console.log('전체 데이터:', dataToUse.length, '개 항목');
    
    // 교수, 조교, 관리자 필터링 
    // oldAssignmentDetail.js와 동일한 방식으로 구현
    let filteredData;
    if (userRole === 'STUDENT') {
      // 학생인 경우 관리자/조교/교수 역할 사용자 제외
      filteredData = dataToUse.filter(item => {
        // 기본 정보가 없는 경우 제외
        if (!item.student_num) return false;
        
        // 관리자/조교/교수 역할을 확인할 수 있는 정보가 있는 경우 제외
        const userInfo = dataToUse.find(s => String(s.student_num || '') === String(item.student_num || ''));
        if (userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'ASSISTANT' || userInfo.role === 'PROFESSOR' ||
                         userInfo.courseRole === 'ADMIN' || userInfo.courseRole === 'ASSISTANT' || userInfo.courseRole === 'PROFESSOR')) {
          return false;
        }
        return true;
      });
    } else {
      // 교수/관리자인 경우 학생만 표시 + 기본 정보가 없는 경우 제외
      filteredData = dataToUse.filter(submission => {
        // 기본 정보가 없는 경우 제외
        if (!submission.student_num) return false;
        
        return submission.role !== 'PROFESSOR' && submission.role !== 'ASSISTANT' && submission.role !== 'ADMIN' &&
          submission.courseRole !== 'PROFESSOR' && submission.courseRole !== 'ASSISTANT' && submission.courseRole !== 'ADMIN';
      });
    }
    
    //console.log('교수/조교/관리자 필터링 후 데이터:', filteredData.length, '개 항목');
    
    // 첫 로드 시 배열이 비어있는지 확인
    if (filteredData.length === 0) {
      //console.warn('차트 데이터가 비어있습니다. 빈 결과 반환');
      return {
        labels: [],
        values: [],
        backgroundColor: [],
        borderColor: [],
        average: 0
      };
    }
    
    // 디버깅용 로그 추가 - 첫 번째 항목의 구조 확인
    // if (filteredData.length > 0) {
    //   console.log('학생 데이터 첫 번째 항목 구조:', filteredData[0]);
    //   console.log('사용 가능한 이름 필드:', 
    //     Object.keys(filteredData[0]).filter(key => 
    //       key.toLowerCase().includes('name') || 
    //       key.toLowerCase().includes('student') || 
    //       key.toLowerCase() === 'user'
    //     )
    //   );
    // }

    // 평균 계산 (필터링된 데이터 기준)
    const average = filteredData.reduce((sum, item) => sum + (item.size_change || 0), 0) / 
                   (filteredData.length || 1);
    
    //console.log('평균 값:', average);

    // 검색 결과에 해당하는지 확인하는 함수
    const isSearchMatch = (item) => {
      // 학생인 경우 검색 기능 대신 자신의 데이터만 하이라이트 처리
      if (userRole === 'STUDENT' && currentUser) {
        const currentUserStudentNum = String(currentUser.studentNum || '');
        const itemStudentNum = String(item.student_num || item.studentNum);
        
        // 현재 로그인한 학생과 일치하는 데이터만 하이라이트
        return currentUserStudentNum && currentUserStudentNum === itemStudentNum;
      }
      
      // 교수/조교/관리자인 경우에만 검색 기능 사용
      if (!searchQuery) return false;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        (item.student_num && String(item.student_num).toLowerCase().includes(searchLower)) ||
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower))
      );
    };

    // 색상 결정 (평균 이상/이하 + 검색 결과 하이라이트)
    const getBarColor = (item) => {
      if (isSearchMatch(item)) {
        return 'rgba(255, 152, 0, 0.8)'; // 검색 결과 하이라이트
      }
      
      return item.size_change >= average 
        ? 'rgba(66, 165, 245, 0.8)' // 평균 이상은 푸른색
        : 'rgba(179, 157, 219, 0.7)'; // 평균 이하는 연한 보라색
    };

    const getBorderColor = (item) => {
      if (isSearchMatch(item)) {
        return 'rgba(230, 81, 0, 1)'; // 검색 결과 하이라이트 테두리
      }
      
      return item.size_change >= average 
        ? 'rgb(30, 136, 229)' // 평균 이상은 진한 푸른색
        : 'rgb(123, 97, 175)'; // 평균 이하는 진한 보라색
    };

    const result = {
      
      labels: filteredData.map(item => {
        // 이름과 학번을 모두 표시하기 위한 형식 변경
        // 확인된 정확한 필드명으로 수정
        const name = item.name || '';
        const studentNum = item.student_num || '';
        const userId = item.user_id || '';
        const role = item.role || item.courseRole || '';
        const email = item.email || '';
        
        // 현재 로그인한 사용자와 학번이 같은지 확인 - 수정된 로직
        let isCurrentUser = false;
        
        if (userRole === 'STUDENT' && currentUser) {
          // 현재 사용자 정보가 있는 경우에만 확인
          const currentUserStudentNum = String(currentUser.studentNum || '');
          const itemStudentNum = String(studentNum || '');
          
          // 현재 사용자의 학번과 item의 학번이 같은지 비교
          isCurrentUser = currentUserStudentNum && currentUserStudentNum === itemStudentNum;
        }
        
        // 학생 이름이 있으면 "이름 (학번)" 형식, 없으면 "학생 (학번)" 형식으로 표시
        // 현재 로그인한 사용자인 경우 "나" 표시 추가
        if (isCurrentUser) {
          // 현재 사용자는 이름이 있으면 "이름 (나)", 없으면 "나"만 표시
          return name ? `${name} (나)\n(${studentNum})` : `나\n(${studentNum})`;
        } else {
          // 다른 사용자는 기본 포맷
          return name ? `${name}\n(${studentNum})` : `학생\n(${studentNum})`;
        }
      }),
      values: filteredData.map(item => item.size_change || 0),
      backgroundColor: filteredData.map(item => getBarColor(item)),
      borderColor: filteredData.map(item => getBorderColor(item)),
      average
    };

    // console.log('최종 차트 데이터:', result);
    return result;
  };

  // 차트 정리 함수
  const cleanupChart = () => {
    try {
      if (plotlyInstance.current) {
        const studentChartElement = document.getElementById('studentChart');
        cleanupChartInstance(studentChartElement, plotlyInstance.current);
        plotlyInstance.current = null;
      }
    } catch (error) {
      //console.error('차트 정리 중 오류 발생:', error);
    }
  };

  // Plotly 차트 초기화/업데이트 함수
  const initPlotly = async () => {
    try {
      // 이미 언마운트된 경우 실행 중지
      if (!chartRef.current) return;
      
      const Plotly = await import('plotly.js-dist');
      plotlyInstance.current = Plotly;
      
      const chartData = prepareChartData();
      const styles = getChartStyles(isDarkMode);
      
      // 데이터가 없는 경우
      if (chartData.labels.length === 0) {
        // console.log('차트 렌더링: 데이터 없음 화면 표시');
        const emptyTrace = {
          x: [],
          y: [],
          type: 'scatter',
          mode: 'lines+markers',
          name: '데이터 없음'
        };
        
        const emptyLayout = {
          title: '데이터가 없습니다',
          font: styles.font,
          paper_bgcolor: styles.paper_bgcolor,
          plot_bgcolor: styles.plot_bgcolor,
          annotations: [{
            text: '해당 데이터가 없거나 로드하는데 실패했습니다',
            showarrow: false,
            font: {
              family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              size: 14
            },
            x: 0.5,
            y: 0.5,
            xref: 'paper',
            yref: 'paper'
          }]
        };
        
        // DOM 요소가 존재하는지 확인 후 차트 생성
        const studentChartElement = document.getElementById('studentChart');
        if (studentChartElement) {
          Plotly.newPlot('studentChart', [emptyTrace], emptyLayout);
        }
        return;
      }
      
      // 차트 데이터 구성
      const plotData = [
        {
          type: 'bar',
          x: chartData.labels,
          y: chartData.values,
          marker: {
            color: chartData.backgroundColor,
            line: {
              color: chartData.borderColor,
              width: 1
            }
          },
          name: '코드 변화량',
          hovertemplate: '<b>%{x}</b><br>코드 변화량: %{y:,.0f} bytes<extra></extra>',
          // 애니메이션 효과 추가
          transforms: [{
            type: 'filter',
            target: 'y',
            operation: '>',
            value: 0
          }]
        },
        {
          type: 'line',
          x: chartData.labels,
          y: Array(chartData.labels.length).fill(chartData.average),
          line: {
            color: 'rgba(255, 99, 132, 0.8)',
            width: 2,
            dash: 'dash'
          },
          name: '평균',
          hovertemplate: '평균: %{y:,.0f} bytes<extra></extra>'
        }
      ];

      // 차트 레이아웃 구성
      const layout = {
        font: styles.font,
        paper_bgcolor: styles.paper_bgcolor,
        plot_bgcolor: styles.plot_bgcolor,
        title: {
          text: '학생별 코드 변화량',
          font: {
            ...styles.font,
            size: 16
          }
        },
        xaxis: {
          tickangle: 45,
          gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
          zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
          color: isDarkMode ? '#F8F8F2' : '#282A36',
          showspikes: true,
          spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
          spikethickness: -2,
          spikemode: 'across',
          spikesnap: 'cursor',
          spikedash: 'dash',
          fixedrange: false,
        },
        yaxis: {
          gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
          zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
          color: isDarkMode ? '#F8F8F2' : '#282A36',
          showspikes: true,
          spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
          spikethickness: -2,
          spikemode: 'across',
          spikesnap: 'cursor',
          spikedash: 'dash',
          tickformat: ',d', // 천 단위 구분 기호 사용, K 단위 삭제
          zeroline: true,
          zerolinewidth: 2,
          fixedrange: false,
          overlaying: 'y',
          // Y축 범위 고정 (최대값의 10% 여유 공간 추가)
          range: [0, Math.max(...chartData.values) * 1.1]
        },
        legend: {
          x: 0.90,
          y: 0.99,
          bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0',
          font: styles.font
        },
        hovermode: 'x',
        hoverdistance: 50000,
        dragmode: 'pan', // 기본 드래그 모드를 pan으로 설정 (레이아웃 레벨)
        barmode: 'group',
        hoverlabel: {
          bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
          font: styles.font,
        },
        margin: {
          l: 50,
          r: 20,
          t: 70, // 상단 여백 증가
          b: 120
        },
        // 애니메이션 효과 설정
        transition: {
          duration: 800,
          easing: 'cubic-in-out'
        },
        frame: {
          duration: 800,
          redraw: false
        }
      };

      // 관리자/교수/조교인 경우 차트에 안내 메시지 추가
      if (canViewStudentDetails) {
        layout.annotations = [
          {
            text: '차트를 클릭하여 학생의 상세 정보를 확인할 수 있습니다',
            showarrow: false,
            font: {
              family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              size: 12,
              color: isDarkMode ? '#8BE9FD' : '#6272A4'
            },
            x: 0.5,
            y: 1.05,
            xref: 'paper',
            yref: 'paper',
            bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0',
            borderwidth: 1,
            borderpad: 4
          }
        ];
      }

      // 차트 설정
      const config = {
        responsive: true,
        displayModeBar: true,
        scrollZoom: true,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        modeBarButtonsToAdd: ['resetScale2d'],
        displaylogo: false,
        toImageButtonOptions: {
          format: 'png',
          filename: '학생별_코드_변화량',
          height: 800,
          width: 1200,
          scale: 2
        }
      };
      
      // DOM 요소가 존재하는지 확인 후 차트 생성
      const studentChartElement = document.getElementById('studentChart');
      if (studentChartElement && chartRef.current) {
        // 바 차트 데이터에 애니메이션 효과 적용을 위한 초기값 설정
        const initialPlotData = [...plotData];
        initialPlotData[0] = {
          ...plotData[0],
          y: plotData[0].y.map(() => 0) // 모든 값을 0으로 시작
        };

        // 초기 차트 생성 (값이 0인 상태로)
        Plotly.newPlot(studentChartElement, initialPlotData, layout, config).then(() => {
          // 실제 데이터로 애니메이션 적용 (한번만 실행), 레이아웃은 변경하지 않음
          Plotly.animate(studentChartElement, {
            data: plotData,
            traces: [0]
          }, {
            transition: {
              duration: 800,
              easing: 'cubic-in-out'
            },
            frame: {
              duration: 800,
              redraw: false
            }
          });
          
          // 관리자/교수/조교인 경우에만 클릭 이벤트 추가
          if (canViewStudentDetails) {
            // 차트 클릭 이벤트 처리
            studentChartElement.on('plotly_click', function(data) {
              if (data.points && data.points.length > 0) {
                const point = data.points[0];
                // 클릭한 x축 레이블값 가져오기
                const clickedLabel = point.x;
                
                // console.log('클릭한 레이블:', clickedLabel);
                // console.log('클릭한 포인트 인덱스:', point.pointIndex);
                // console.log('클릭한 포인트 정보:', point);
                
                // 클릭한 레이블과 일치하는 데이터 찾기 (학번 정보 추출)
                // 레이블 형식: 이름\n(학번)
                const labelMatch = String(clickedLabel).match(/\(([^)]+)\)/);
                const studentNum = labelMatch ? labelMatch[1] : null;
                
                if (studentNum) {
                  //console.log('추출된 학번:', studentNum);
                  
                  // 원본 데이터에서 해당 학번을 가진 학생 찾기
                  // 확인된 정확한 필드명으로 수정
                  const matchedStudent = processedData.find(item => 
                    String(item.student_num) === studentNum                 
                  );
                  
                  if (matchedStudent) {
                    //console.log('매칭된 학생 데이터:', matchedStudent);
                    
                    // StudentSelector 컴포넌트에 전달할 데이터 준비 - 정확한 필드명으로 수정
                    const studentInfo = {
                      name: matchedStudent.name || '학생',
                      studentNum: matchedStudent.student_num,
                      email: matchedStudent.email || '',
                      userId: matchedStudent.user_id || '',
                      totalChanges: matchedStudent.size_change || 0
                    };
                    
                    //console.log('선택된 학생 정보:', studentInfo);
                    
                    // 부모 컴포넌트에서 onStudentClick 함수가 제공된 경우
                    if (onStudentClick) {
                      //console.log('부모 컴포넌트의 onStudentClick 함수 호출');
                      
                      // 함수가 함수인지 확인 (객체가 아님)
                      if (typeof onStudentClick === 'function') {
                        // 학생 정보를 부모 컴포넌트에 전달
                        onStudentClick(studentInfo);
                      } else {
                        //console.error('onStudentClick이 함수가 아닙니다:', onStudentClick);
                        // 내부 다이얼로그로 폴백
                        setSelectedStudent(studentInfo);
                        setOpenDialog(true);
                      }
                    } else {
                      // 부모 컴포넌트가 없는 경우 내부 다이얼로그 표시
                      setSelectedStudent(studentInfo);
                      setOpenDialog(true);
                    }
                  } else {
                    //console.error('해당 학번에 일치하는 학생을 찾을 수 없습니다:', studentNum);
                  }
                } else {
                 // console.error('클릭한 레이블에서 학번을 추출할 수 없습니다:', clickedLabel);
                }
              }
            });
           
            // 커서 스타일 변경 - 클릭 가능함을 표시
            studentChartElement.style.cursor = 'pointer';
          }
        }).catch(error => {
          //console.error('차트 생성 중 오류 발생:', error);
        });
      }
      
    } catch (error) {
      //console.error('학생 차트 생성 오류:', error);
    }
  };

  useEffect(() => {
    // 기존 차트 정리
    cleanupChart();
    
    // 차트 초기화
    initPlotly();
    
    // 컴포넌트 언마운트시 차트 정리
    return () => {
      cleanupChart();
    };
  }, [data, searchQuery, isDarkMode, userRole, canViewStudentDetails, processedData]);

  // 다이얼로그 닫기 핸들러
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  // JCode 이동 핸들러
  const handleJCodeRedirect = (student) => {
    //console.log('JCode로 이동:', student);
    if (onStudentClick && typeof onStudentClick.onJCodeRedirect === 'function') {
      onStudentClick.onJCodeRedirect(student);
    } else {
      // 폴백 구현
      if (student.email) {
        window.open(`/api/redirect?userEmail=${student.email}`, '_blank');
      } else {
        //console.error('학생 이메일 정보가 없어 JCode로 이동할 수 없습니다.');
      }
    }
  };

  // Watcher 이동 핸들러
  const handleWatcherRedirect = (student) => {
    //console.log('Watcher로 이동:', student);
    if (onStudentClick && typeof onStudentClick.onWatcherRedirect === 'function') {
      onStudentClick.onWatcherRedirect(student);
    } else {
      // 폴백 구현 (기존 로직 유지)
      if (student.userId) {
        // URL에서 courseId와 assignmentId를 추출
        const urlParams = new URL(window.location.href);
        const pathParts = urlParams.pathname.split('/');
        
        // URL 경로에서 courseId와 assignmentId 찾기
        let courseId, assignmentId;
        for (let i = 0; i < pathParts.length; i++) {
          if (pathParts[i] === 'class' && i + 1 < pathParts.length) {
            courseId = pathParts[i + 1];
          } else if (pathParts[i] === 'assignment' && i + 1 < pathParts.length) {
            assignmentId = pathParts[i + 1];
          }
        }
        
        if (courseId && assignmentId) {
          const watcherUrl = `/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${student.userId}`;
          //console.log('이동할 Watcher URL:', watcherUrl);
          window.open(watcherUrl, '_blank');
        } else {
          // URL에서 코스 ID와 과제 ID를 가져올 수 없는 경우
          //console.error('현재 URL에서 courseId와 assignmentId를 찾을 수 없습니다:', window.location.href);
          //console.log('대체 URL로 이동 시도');
          window.open(`/watcher/student/${student.userId}`, '_blank');
        }
      } else {
        //console.error('학생 ID 정보가 없어 Watcher로 이동할 수 없습니다.');
      }
    }
  };

  //console.log('차트 렌더링: 데이터 있음, 차트 표시');
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 1, borderRadius: 2 }}>
      <div id="studentChart" style={{ width: '100%', height: '600px' }} ref={chartRef}></div>
      
      {/* 관리자/교수/조교인 경우에만 StudentSelector 다이얼로그 표시 */}
      {canViewStudentDetails && !onStudentClick && (
        <StudentSelector 
          open={openDialog}
          onClose={handleCloseDialog}
          student={selectedStudent}
          onJCodeRedirect={handleJCodeRedirect}
          onWatcherRedirect={handleWatcherRedirect}
        />
      )}
    </Paper>
  );
};

export default StudentChart; 