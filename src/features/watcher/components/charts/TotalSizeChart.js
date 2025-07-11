import React, { useMemo } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { PlotlyChart } from '../../../../components/ui';
import { 
  getHoverTemplate, 
  createLogTraces, 
  getTimeFormatStops 
} from './ChartUtils';

// 차트 간 동기화를 위한 이벤트 버스 (기존 코드와 호환성 유지)
export const chartSyncEvents = {
  xAxisUpdate: null,
  isSyncing: false,
  debounceTimeout: null
};

const TotalSizeChart = ({ data, student, assignment, runLogs = [], buildLogs = [] }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 차트 데이터가 없는 경우 처리
  const hasData = data && data.totalBytes && data.totalBytes.length > 0;
  
  // 차트 트레이스 메모이제이션
  const traces = useMemo(() => {
    if (!hasData) return [];

    // 전체 크기 차트 트레이스
    const totalSizeTrace = {
      x: data.formattedTimes,
      y: data.totalBytes,
      type: 'scatter',
      mode: 'lines+markers',
      name: '전체 코드 크기',
      line: {
        color: isDarkMode ? '#BD93F9' : '#6272A4',
        width: 3,
        shape: 'hv'  // 계단식 라인 차트
      },
      marker: {
        color: isDarkMode ? '#BD93F9' : '#6272A4', 
        size: 3
      },
      hoverinfo: 'x+y+text',
      hovertemplate: getHoverTemplate('totalSize', true),
      hoverlabel: {
        bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
        font: {color: isDarkMode ? '#F8F8F2' : '#282A36'}
      },
      yaxis: 'y2'
    };

    // 로그 트레이스 생성
    const logTraces = createLogTraces(runLogs, buildLogs, isDarkMode);
    
    // 로그 트레이스 yaxis 속성 변경 (y2에서 y로)
    if (logTraces.runLogsSuccessTrace) logTraces.runLogsSuccessTrace.yaxis = 'y';
    if (logTraces.runLogsFailTrace) logTraces.runLogsFailTrace.yaxis = 'y';
    if (logTraces.buildLogsSuccessTrace) logTraces.buildLogsSuccessTrace.yaxis = 'y';
    if (logTraces.buildLogsFailTrace) logTraces.buildLogsFailTrace.yaxis = 'y';
    
    // 모든 트레이스 합치기
    const chartTraces = [totalSizeTrace];
    
    // 로그 데이터가 있을 경우에만 해당 트레이스 추가
    if (runLogs.filter(log => log.exit_code === 0).length > 0) {
      chartTraces.push(logTraces.runLogsSuccessTrace);
    }
    if (runLogs.filter(log => log.exit_code !== 0).length > 0) {
      chartTraces.push(logTraces.runLogsFailTrace);
    }
    if (buildLogs.filter(log => log.exit_code === 0).length > 0) {
      chartTraces.push(logTraces.buildLogsSuccessTrace);
    }
    if (buildLogs.filter(log => log.exit_code !== 0).length > 0) {
      chartTraces.push(logTraces.buildLogsFailTrace);
    }

    return chartTraces;
  }, [data, runLogs, buildLogs, isDarkMode, hasData]);

  // 차트 레이아웃 메모이제이션
  const layout = useMemo(() => ({
    yaxis: {
      title: '로그 유형',
      titlefont: {
        color: isDarkMode ? '#FFB86C' : '#FF9800',
      },
      tickfont: {
        color: isDarkMode ? '#FFB86C' : '#FF9800',
      },
      showgrid: false,
      range: [0, 5],
      tickvals: [1, 2, 3, 4],
      ticktext: ['빌드 실패', '빌드 성공', '실행 실패', '실행 성공'],
      zeroline: false,
      side: 'left',
      fixedrange: true,
      autorange: false,
      constrain: 'domain'
    },
    // 코드 크기 Y축 설정
    yaxis2: {
      title: '바이트',
      tickformat: ',d', // 천 단위 구분 기호 사용
      fixedrange: false, // 바이트 축은 확대/축소 가능하게 설정
      overlaying: 'y',
      side: 'right'
    },
    margin: { t: 30, r: 100, b: 60, l: 100 }, // 양쪽 여백 확보
    hovermode: 'x',
    hoverdistance: 10,
    dragmode: 'pan', // 기본 드래그 모드를 pan으로 설정
  }), [isDarkMode]);

  // 차트 설정 메모이제이션
  const config = useMemo(() => ({
    scrollZoom: true,
    modeBarButtonsToAdd: ['resetScale2d'],
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
  }), []);

  return (
    <Box sx={{ width: '100%', height: '500px' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          height: '100%', 
          p: 1, 
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#282a36' : '#ffffff',
          border: theme => `1px solid ${theme.palette.mode === 'dark' ? '#44475a' : '#e0e0e0'}`,
          borderRadius: '8px'
        }}
      >
        <PlotlyChart
          chartId="totalSizeChart"
          title="전체 코드 크기 변화 및 로그 기록"
          traces={traces}
          loading={false}
          error={null}
          xAxis={{ 
            title: '시간',
            tickformat: '%Y-%m-%d %H:%M:%S',
            tickformatstops: getTimeFormatStops()
          }}
          yAxis={{ title: '로그 유형' }}
          layout={layout}
          config={config}
          height="450px"
          student={student}
          assignment={assignment}
          chartType="totalSize"
          showLegend={true}
          syncWith="changeChart"
          syncEvents={chartSyncEvents}
        />
      </Paper>
    </Box>
  );
};

export default TotalSizeChart; 