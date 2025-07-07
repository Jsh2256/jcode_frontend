import React, { useEffect, useRef } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { 
  getHoverTemplate, 
  createLogTraces, 
  createLogYAxisLayout, 
  findNearestLog,
  getTimeFormatStops 
} from './ChartUtils';
import { CHART_FONT_FAMILY } from '../../../constants/chartConfig';

// 차트 간 동기화를 위한 이벤트 버스
export const chartSyncEvents = {
  xAxisUpdate: null,
  isSyncing: false, // 동기화 중인지 여부를 판단하는 플래그
  debounceTimeout: null // 디바운스를 위한 타임아웃 ID
};

const TotalSizeChart = ({ data, student, assignment, runLogs = [], buildLogs = [] }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Plotly 차트 생성 및 업데이트
  useEffect(() => {
    const initPlotly = async () => {
      try {
        const Plotly = await import('plotly.js-dist');
        window.Plotly = Plotly;
        
        // 데이터가 비어있는 경우 빈 차트 생성
        if (!data || !data.totalBytes || data.totalBytes.length === 0) {
          const emptyTrace = {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: '데이터 없음'
          };
          
          const emptyLayout = {
            title: '데이터가 없습니다',
            font: {
              family: CHART_FONT_FAMILY,
              color: isDarkMode ? '#F8F8F2' : '#282A36'
            },
            paper_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : '#FFFFFF',
            plot_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.4)' : '#FFFFFF',
            annotations: [{
              text: '해당 데이터가 없거나 로드하는데 실패했습니다',
              showarrow: false,
              font: {
                family: CHART_FONT_FAMILY,
                size: 14
              },
              x: 0.5,
              y: 0.5,
              xref: 'paper',
              yref: 'paper'
            }]
          };
          
          // DOM 요소가 존재하는지 확인 후 차트 생성
          const totalSizeElement = document.getElementById('totalSizeChart');
          if (totalSizeElement) {
            chartInstance.current = Plotly.newPlot('totalSizeChart', [emptyTrace], emptyLayout);
          }
          return;
        }
        
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
        const traces = [totalSizeTrace];
        
        // 로그 데이터가 있을 경우에만 해당 트레이스 추가
        if (runLogs.filter(log => log.exit_code === 0).length > 0) {
          traces.push(logTraces.runLogsSuccessTrace);
        }
        if (runLogs.filter(log => log.exit_code !== 0).length > 0) {
          traces.push(logTraces.runLogsFailTrace);
        }
        if (buildLogs.filter(log => log.exit_code === 0).length > 0) {
          traces.push(logTraces.buildLogsSuccessTrace);
        }
        if (buildLogs.filter(log => log.exit_code !== 0).length > 0) {
          traces.push(logTraces.buildLogsFailTrace);
        }
        
        // 레이아웃 설정
        const totalLayout = {
          title: '전체 코드 크기 변화 및 로그 기록',
          font: {
            family: CHART_FONT_FAMILY,
            color: isDarkMode ? '#F8F8F2' : '#282A36'
          },
          paper_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : '#FFFFFF',
          plot_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.4)' : '#FFFFFF',
          xaxis: {
            title: '시간',
            gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
            zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
            color: isDarkMode ? '#F8F8F2' : '#282A36',
            showspikes: true,
            spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
            spikethickness: 1,
            spikemode: 'across',
            spikesnap: 'cursor',
            spikedash: 'dash',
            tickformat: '%Y-%m-%d %H:%M:%S',
            tickformatstops: getTimeFormatStops()
          },
          yaxis: {
            title: '로그 유형',
            titlefont: {
              color: isDarkMode ? '#FFB86C' : '#FF9800',
              family: CHART_FONT_FAMILY,
            },
            tickfont: {
              color: isDarkMode ? '#FFB86C' : '#FF9800',
              family: CHART_FONT_FAMILY,
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
            gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
            zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
            color: isDarkMode ? '#F8F8F2' : '#282A36',
            showspikes: true,
            spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
            spikethickness: 1,
            spikemode: 'across',
            spikesnap: 'cursor',
            spikedash: 'dash',
            tickformat: ',d', // 천 단위 구분 기호 사용
            fixedrange: false, // 바이트 축은 확대/축소 가능하게 설정
            overlaying: 'y',
            side: 'right'
          },
          margin: { t: 30, r: 100, b: 60, l: 100 }, // 양쪽 여백 확보
          hovermode: 'x',
          hoverdistance: 10,
          dragmode: 'pan', // 기본 드래그 모드를 pan으로 설정 (레이아웃 레벨)
          hoverlabel: {
            bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
            bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0',
            font: {
              family: CHART_FONT_FAMILY,
              color: isDarkMode ? '#F8F8F2' : '#282A36',
              size: 12
            }
          },
          showlegend: true,
          legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0'
          }
        };
        
        // DOM 요소가 존재하는지 확인 후 차트 생성
        const totalSizeElement = document.getElementById('totalSizeChart');
        if (totalSizeElement) {
          // 파일 이름 설정
          const studentName = student ? student.name : '학생';
          const assignmentName = assignment ? assignment.assignmentName : '과제';
          const fileName = `${studentName}_${assignmentName}_전체코드크기차트_${new Date().toISOString().split('T')[0]}`;
          
          chartInstance.current = Plotly.newPlot('totalSizeChart', traces, totalLayout, {
            responsive: true,
            displayModeBar: true,
            scrollZoom: true, // 전체 스크롤 줌 활성화 (y2축은 fixedrange로 고정됨)
            modeBarButtonsToAdd: [
              'resetScale2d'
            ],
            showTips: false,
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
            displaylogo: false,
            toImageButtonOptions: {
              format: 'png',
              filename: fileName,
              height: 800,
              width: 1200,
              scale: 2
            }
          });
          
          // 차트 동기화 이벤트 설정
          totalSizeElement.on('plotly_relayout', function(eventData) {
            // 이미 동기화 중이면 무시
            if (chartSyncEvents.isSyncing) return;
            
            // 디바운스 적용
            if (chartSyncEvents.debounceTimeout) {
              clearTimeout(chartSyncEvents.debounceTimeout);
            }
            
            chartSyncEvents.debounceTimeout = setTimeout(() => {
              if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
                try {
                  // 동기화 상태 설정
                  chartSyncEvents.isSyncing = true;
                  
                  // xAxis 범위가 변경되면 이벤트 발생
                  chartSyncEvents.xAxisUpdate = {
                    source: 'totalSizeChart',
                    range: [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']]
                  };
                  
                  // changeChart 동기화
                  const changeChartElement = document.getElementById('changeChart');
                  if (changeChartElement && chartSyncEvents.xAxisUpdate.source !== 'changeChart') {
                    Plotly.relayout('changeChart', {
                      'xaxis.range[0]': eventData['xaxis.range[0]'],
                      'xaxis.range[1]': eventData['xaxis.range[1]']
                    });
                  }
                  
                  // 동기화 완료 후 상태 해제
                  setTimeout(() => {
                    chartSyncEvents.isSyncing = false;
                  }, 100);
                } catch (err) {
                  chartSyncEvents.isSyncing = false;
                }
              }
            }, 200); // 200ms 디바운스
          });
        }
      } catch (err) {
      }
    };
    
    initPlotly();
    
    // 컴포넌트 언마운트시 차트 정리
    return () => {
      // window.Plotly가 있고, DOM 요소가 존재하는 경우에만 purge 실행
      if (window.Plotly) {
        // 각 차트 요소가 존재하는지 확인 후 purge
        const totalSizeElement = document.getElementById('totalSizeChart');
        if (totalSizeElement) {
          window.Plotly.purge('totalSizeChart');
        }
      }
    };
  }, [data, isDarkMode, student, assignment, runLogs, buildLogs]);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 1, 
        mb: 4, 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#282a36' : '#ffffff',
        border: theme => `1px solid ${theme.palette.mode === 'dark' ? '#44475a' : '#e0e0e0'}`,
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        minHeight: '500px' 
      }} id="totalSizeChart" ref={chartRef} />
    </Paper>
  );
};

export default TotalSizeChart; 