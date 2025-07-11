import React, { useMemo } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { PlotlyChart } from '../../../../components/ui';
import { chartSyncEvents } from './TotalSizeChart';
import { getHoverTemplate, getTimeFormatStops } from './ChartUtils';

const ChangeChart = ({ data, student, assignment }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 차트 데이터가 없는 경우 처리
  const hasData = data && data.additions && data.additions.length > 0;
  
  // 차트 트레이스 메모이제이션
  const traces = useMemo(() => {
    if (!hasData) return [];

    // 값이 0인 데이터는 필터링하여 표시하지 않음
    const filteredAdditions = data.additions.map((val, idx) => ({
      value: val,
      timestamp: data.formattedTimes[idx]
    })).filter(item => item.value > 0);
    
    const filteredDeletions = data.deletions.map((val, idx) => ({
      value: val,
      timestamp: data.formattedTimes[idx]
    })).filter(item => item.value > 0);

    // 추가된 코드 트레이스
    const addTrace = {
      x: filteredAdditions.map(item => item.timestamp),
      y: filteredAdditions.map(item => item.value),
      type: 'bar',
      name: '추가된 코드',
      marker: {
        color: isDarkMode ? '#50FA7B' : '#4E5C8E',
        line: {
          width: 1,
          color: isDarkMode ? '#44475A' : '#E0E0E0'
        }
      },
      hoverinfo: 'x+y+text',
      hovertemplate: getHoverTemplate('addition', true),
      hoverlabel: {
        bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
        font: {color: isDarkMode ? '#F8F8F2' : '#282A36'}
      },
      yaxis: 'y2'
    };
    
    // 삭제된 코드 트레이스
    const delTrace = {
      x: filteredDeletions.map(item => item.timestamp),
      y: filteredDeletions.map(item => item.value).map(val => -val),
      type: 'bar',
      name: '삭제된 코드',
      marker: {
        color: isDarkMode ? '#FF5555' : '#FF79C6',
        line: {
          width: 1,
          color: isDarkMode ? '#44475A' : '#E0E0E0'
        }
      },
      hoverinfo: 'x+y+text',
      hovertemplate: getHoverTemplate('deletion', true),
      customdata: filteredDeletions.map(item => item.value),
      hoverlabel: {
        bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
        font: {color: isDarkMode ? '#F8F8F2' : '#282A36'}
      },
      yaxis: 'y2'
    };

    return [addTrace, delTrace];
  }, [data, isDarkMode, hasData]);

  // 차트 레이아웃 메모이제이션
  const layout = useMemo(() => ({
    yaxis: {
      title: '',
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      fixedrange: true
    },
    yaxis2: {
      title: '바이트 (추가/삭제)',
      tickformat: ',d', // 천 단위 구분 기호 사용
      zeroline: true,
      zerolinewidth: 2,
      zerolinecolor: isDarkMode ? '#FF79C6' : '#FF5555', // 0선 강조
      overlaying: 'y',
      side: 'right'
    },
    margin: { t: 30, r: 100, b: 60, l: 100 },
    hovermode: 'x',
    hoverdistance: 50000,
    dragmode: 'pan', // 기본 드래그 모드를 pan으로 설정
    barmode: 'relative'
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
          chartId="changeChart"
          //title="코드 변경 추이"
          traces={traces}
          loading={false}
          error={null}
          xAxis={{ 
            title: '시간 (추정)',
            tickformat: '%Y-%m-%d %H:%M',
            tickformatstops: getTimeFormatStops()
          }}
          yAxis={{ title: '바이트 (추가/삭제)' }}
          layout={layout}
          config={config}
          height="450px"
          student={student}
          assignment={assignment}
          chartType="change"
          showLegend={true}
          syncWith="totalSizeChart"
          syncEvents={chartSyncEvents}
        />
      </Paper>
    </Box>
  );
};

export default ChangeChart; 