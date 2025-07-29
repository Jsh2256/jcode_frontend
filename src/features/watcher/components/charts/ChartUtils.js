// 차트 스타일 및 유틸리티 함수
import { CHART_FONT_FAMILY } from '../../../../constants/chartConfig';

// 다크모드에 따른 공통 스타일 설정
export const getChartStyles = (isDarkMode) => {
  return {
    font: {
      family: CHART_FONT_FAMILY,
      color: isDarkMode ? '#F8F8F2' : '#282A36'
    },
    paper_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : '#FFFFFF',
    plot_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.4)' : '#FFFFFF',
    gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
    zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
    colors: {
      primary: isDarkMode ? '#BD93F9' : '#6272A4',
      addition: isDarkMode ? '#50FA7B' : '#4E5C8E',
      deletion: isDarkMode ? '#FF5555' : '#FF79C6'
    },
    hoverlabel: {
      bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
      bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0',
      font: {
        family: CHART_FONT_FAMILY,
        color: isDarkMode ? '#F8F8F2' : '#282A36',
        size: 12
      }
    },
    legend: {
      x: 0.01,
      y: 0.99,
      bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0'
    },
    axis: {
      showspikes: true,
      spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
      spikethickness: 1,
      spikemode: 'across'
    }
  };
};

// 시간 포맷 설정 (x축에 표시되는 형식)
export const getTimeFormatStops = () => {
  return [
    {
      dtickrange: [null, 1000], // 1초 미만
      value: '%m-%d %H:%M:%S.%L'
    },
    {
      dtickrange: [1000, 60000], // 1초-1분
      value: '%m-%d %H:%M:%S'
    },
    {
      dtickrange: [60000, 3600000], // 1분-1시간
      value: '%m-%d %H:%M'
    },
    {
      dtickrange: [3600000, 86400000], // 1시간-1일
      value: '%m-%d %H:%M'
    },
    {
      dtickrange: [86400000, 604800000], // 1일-1주
      value: '%m-%d'
    },
    {
      dtickrange: [604800000, null], // 1주 이상
      value: '%Y-%m-%d'
    }
  ];
};

// // 툴팁에 표시할 날짜 형식 설정
// export const getTooltipDateFormat = (date) => {
//   if (!date) return '';
  
//   // 날짜가 문자열이면 Date 객체로 변환
//   let dateObj = date;
//   if (typeof date === 'string') {
//     dateObj = new Date(date);
//     // 날짜 변환에 실패한 경우
//     if (isNaN(dateObj.getTime())) {
//       return date; // 원본 문자열 반환
//     }
//   }
  
//   // 년-월-일 시:분:초 형식으로 변환
//   const year = dateObj.getFullYear();
//   const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//   const day = String(dateObj.getDate()).padStart(2, '0');
//   const hours = String(dateObj.getHours()).padStart(2, '0');
//   const minutes = String(dateObj.getMinutes()).padStart(2, '0');
//   const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
//   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// };

// 툴팁 hovertemplate 생성
export const getHoverTemplate = (type, includeDate = true) => {
  const datePart = includeDate ? '<b>시간</b>: %{x|%Y-%m-%d %H:%M:%S}<br>' : '';
  
  switch (type) {
    case 'totalSize':
      return `${datePart}<b>크기</b>: %{y} B<extra></extra>`;
    case 'addition':
      return `${datePart}<b>변화량</b>: <b>+ %{y} B</b><extra></extra>`;
    case 'deletion':
      return `${datePart}<b>변화량</b>: <b>- %{customdata} B</b><extra></extra>`;
    default:
      return `${datePart}<b>값</b>: %{y}<extra></extra>`;
  }
};

// 빈 데이터를 위한 차트 생성 - 이제 PlotlyChart 컴포넌트에서 처리됨
// export const createEmptyChart = (chartId, isDarkMode, title = '데이터가 없습니다') => {
//   // PlotlyChart 컴포넌트가 빈 데이터 처리를 담당하므로 더 이상 필요하지 않음
// };

// 가상 타임스탬프 생성
export const generateFakeTimestamps = (dataLength) => {
  return Array(dataLength).fill(0).map((_, index) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - (dataLength - index));
    return date.toLocaleString('ko-KR');
  });
};

// 차트 이미지 저장 옵션
export const getImageSaveOptions = (student, assignment, chartType) => {
  const studentName = student ? student.name : '학생';
  const assignmentName = assignment ? assignment.assignmentName : '과제';
  const fileName = `${studentName}_${assignmentName}_${chartType}_${new Date().toISOString().split('T')[0]}`;
  
  return {
    format: 'png',
    filename: fileName,
    height: 800,
    width: 1200,
    scale: 2
  };
};

// 차트 동기화 설정 - PlotlyChart 컴포넌트에서 처리하도록 변경 예정
// export const setupChartSync = (chartId, otherChartId, chartSyncEvents) => {
//   // 향후 PlotlyChart 컴포넌트 차원에서 차트 동기화 기능을 구현할 예정
//   console.warn('setupChartSync는 더 이상 사용되지 않습니다. PlotlyChart 컴포넌트를 사용하세요.');
// };

// 로그 카테고리 정의
export const LOG_CATEGORIES = {
  '실행 성공': 4,
  '실행 실패': 3,
  '빌드 성공': 2,
  '빌드 실패': 1
};

// 로그 트레이스 생성 함수
export const createLogTraces = (runLogs, buildLogs, isDarkMode) => {
  // 실행 성공 로그 트레이스
  const runLogsSuccessTrace = {
    x: runLogs.filter(log => log.exit_code === 0).map(log => {
      // timestamp가 문자열이면 Date 객체로 변환
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: runLogs.filter(log => log.exit_code === 0).map(() => LOG_CATEGORIES['실행 성공']),
    type: 'scatter',
    mode: 'markers',
    name: '실행 성공',
    yaxis: 'y2',
    marker: {
      symbol: 'circle',
      size: 12,
      color: isDarkMode ? 'rgba(80, 250, 123, 0.8)' : 'rgba(76, 175, 80, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#50FA7B' : '#4CAF50'
      }
    },
    text: runLogs.filter(log => log.exit_code === 0).map(log => {
      const stdoutPreview = log.stdout ? log.stdout.substring(0, 150) + (log.stdout.length > 150 ? '...' : '') : '없음';
      return `<b>실행 성공</b><br>` +
        `시간: ${new Date(log.timestamp).toLocaleString()}<br>` +
        `명령어: ${log.cmdline || log.command || '알 수 없음'}<br>` +
        (log.cwd ? `작업 디렉토리: ${log.cwd}<br>` : '');
    }),
    hoverinfo: 'text',
    hoverlabel: {
      bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      bordercolor: isDarkMode ? '#50FA7B' : '#4CAF50',
      font: {color: isDarkMode ? '#F8F8F2' : '#282A36'},
      align: 'left'
    }
  };
  
  // 실행 실패 로그 트레이스
  const runLogsFailTrace = {
    x: runLogs.filter(log => log.exit_code !== 0).map(log => {
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: runLogs.filter(log => log.exit_code !== 0).map(() => LOG_CATEGORIES['실행 실패']),
    type: 'scatter',
    mode: 'markers',
    name: '실행 실패',
    yaxis: 'y2',
    marker: {
      symbol: 'circle',
      size: 12,
      color: isDarkMode ? 'rgba(255, 85, 85, 0.8)' : 'rgba(244, 67, 54, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#FF5555' : '#F44336'
      }
    },
    text: runLogs.filter(log => log.exit_code !== 0).map(log => {
      const stderrPreview = log.stderr ? log.stderr.substring(0, 150) + (log.stderr.length > 150 ? '...' : '') : '없음';
      return `<b>실행 실패</b><br>` +
        `시간: ${new Date(log.timestamp).toLocaleString()}<br>` +
        `명령어: ${log.cmdline || log.command || '알 수 없음'}<br>` +
        (log.cwd ? `작업 디렉토리: ${log.cwd}<br>` : '');
    }),
    hoverinfo: 'text',
    hoverlabel: {
      bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      bordercolor: isDarkMode ? '#FF5555' : '#F44336',
      font: {color: isDarkMode ? '#F8F8F2' : '#282A36'},
      align: 'left'
    }
  };
  
  // 빌드 성공 로그 트레이스
  const buildLogsSuccessTrace = {
    x: buildLogs.filter(log => log.exit_code === 0).map(log => {
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: buildLogs.filter(log => log.exit_code === 0).map(() => LOG_CATEGORIES['빌드 성공']),
    type: 'scatter',
    mode: 'markers',
    name: '빌드 성공',
    yaxis: 'y2',
    marker: {
      symbol: 'diamond',
      size: 12,
      color: isDarkMode ? 'rgba(139, 233, 253, 0.8)' : 'rgba(33, 150, 243, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#8BE9FD' : '#2196F3'
      }
    },
    text: buildLogs.filter(log => log.exit_code === 0).map(log => {
      const stdoutPreview = log.stdout ? log.stdout.substring(0, 150) + (log.stdout.length > 150 ? '...' : '') : '없음';
      return `<b>빌드 성공</b><br>` +
        `시간: ${new Date(log.timestamp).toLocaleString()}<br>` +
        `명령어: ${log.cmdline || log.command || '알 수 없음'}<br>` +
        (log.target_path ? `대상 파일: ${log.target_path}<br>` : '');
    }),
    hoverinfo: 'text',
    hoverlabel: {
      bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      bordercolor: isDarkMode ? '#8BE9FD' : '#2196F3',
      font: {color: isDarkMode ? '#F8F8F2' : '#282A36'},
      align: 'left'
    }
  };
  
  // 빌드 실패 로그 트레이스
  const buildLogsFailTrace = {
    x: buildLogs.filter(log => log.exit_code !== 0).map(log => {
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: buildLogs.filter(log => log.exit_code !== 0).map(() => LOG_CATEGORIES['빌드 실패']),
    type: 'scatter',
    mode: 'markers',
    name: '빌드 실패',
    yaxis: 'y2',
    marker: {
      symbol: 'diamond',
      size: 12,
      color: isDarkMode ? 'rgba(255, 184, 108, 0.8)' : 'rgba(255, 152, 0, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#FFB86C' : '#FF9800'
      }
    },
    text: buildLogs.filter(log => log.exit_code !== 0).map(log => {
      const stderrPreview = log.stderr ? log.stderr.substring(0, 150) + (log.stderr.length > 150 ? '...' : '') : '없음';
      return `<b>빌드 실패</b><br>` +
        `시간: ${new Date(log.timestamp).toLocaleString()}<br>` +
        `명령어: ${log.cmdline || log.command || '알 수 없음'}<br>` +
        (log.target_path ? `대상 파일: ${log.target_path}<br>` : '');
    }),
    hoverinfo: 'text',
    hoverlabel: {
      bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      bordercolor: isDarkMode ? '#FFB86C' : '#FF9800',
      font: {color: isDarkMode ? '#F8F8F2' : '#282A36'},
      align: 'left'
    }
  };

  // 사용 가능한 모든 트레이스 객체 반환
  return {
    runLogsSuccessTrace,
    runLogsFailTrace,
    buildLogsSuccessTrace,
    buildLogsFailTrace
  };
};

// Y축 레이아웃 설정을 위한 함수
export const createLogYAxisLayout = (isDarkMode) => {
  return {
    title: '로그 유형',
    titlefont: {
      color: isDarkMode ? '#FFB86C' : '#FF9800',
      family: CHART_FONT_FAMILY,
    },
    tickfont: {
      color: isDarkMode ? '#FFB86C' : '#FF9800',
      family: CHART_FONT_FAMILY,
    },
    overlaying: 'y',
    side: 'right',
    showgrid: false,
    range: [0, 5],
    tickvals: [1, 2, 3, 4],
    ticktext: ['빌드 실패', '빌드 성공', '실행 실패', '실행 성공'],
    zeroline: false,
    fixedrange: true, // y2축 확대/축소 비활성화
    autorange: false, // 자동 범위 조정 비활성화
    constrain: 'domain' // 도메인 내에서 고정
  };
};

// 날짜 변환 유틸리티 함수
export const getDateFromValue = (value) => {
  if (typeof value === 'number') {
    return new Date(value);
  } else if (typeof value === 'string') {
    return new Date(value);
  }
  return value; // 이미 Date 객체인 경우
};

// 로그 찾기 유틸리티 함수
export const findNearestLog = (logs, logType, clickedX, clickedY = null, maxTimeDiff = 3600000) => {
  const clickedDate = getDateFromValue(clickedX);
  let bestMatch = null;
  let minTimeDiff = Infinity;
  
  // 클릭한 Y 값을 기준으로 해당 로그 카테고리 값 가져오기
  // 클릭한 Y 값이 없으면 로그 타입으로부터 Y 값 유추
  const expectedYValue = clickedY !== null ? clickedY : LOG_CATEGORIES[logType];

  //console.log('로그 찾기 - 클릭 위치:', { x: clickedDate, y: clickedY, 기대Y값: expectedYValue, 로그타입: logType });
  
  for (const log of logs) {
    // 로그 타입과 종료 코드 일치 여부 확인
    if ((logType === '실행 성공' && log.exit_code === 0) || 
        (logType === '실행 실패' && log.exit_code !== 0) ||
        (logType === '빌드 성공' && log.exit_code === 0) ||
        (logType === '빌드 실패' && log.exit_code !== 0)) {
      
      const logDate = getDateFromValue(log.timestamp);
      const timeDiff = Math.abs(logDate.getTime() - clickedDate.getTime());
      
      // Y 값까지 정확히 일치하는 경우 가중치 부여
      // Y 값이 일치하면 시간 차이를 절반으로 줄여서 우선순위 증가
      const effectiveTimeDiff = (clickedY !== null && 
                                Math.abs(expectedYValue - LOG_CATEGORIES[logType]) < 0.5) ? 
                                timeDiff * 0.5 : timeDiff;
      
      if (effectiveTimeDiff < minTimeDiff) {
        minTimeDiff = effectiveTimeDiff;
        bestMatch = log;
      }
    }
  }

  // 로그를 찾았고 시간 차이가 허용 범위 내인 경우
  if (bestMatch && minTimeDiff < maxTimeDiff) {
    // console.log('로그 찾기 결과:', { 
    //   로그: bestMatch, 
    //   시간차이: minTimeDiff, 
    //   타입: logType,
    //   시간: bestMatch.timestamp
    // });
    
    return {
      log: bestMatch,
      timeDiff: minTimeDiff,
      isRunLog: logType.includes('실행'),
      yValue: LOG_CATEGORIES[logType]
    };
  }

  //console.log('로그 찾기 실패: 일치하는 로그 없음');
  return null;
}; 