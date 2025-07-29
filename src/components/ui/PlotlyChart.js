import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getChartStyles, getTimeFormatStops, getHoverTemplate, getImageSaveOptions } from '../../features/watcher/components/charts/ChartUtils';
import LoadingSpinner from './LoadingSpinner';

// Plotly 동적 로딩을 위한 캐시
let plotlyModule = null;
let plotlyLoadPromise = null;

// Plotly 로드 함수 (메모이제이션)
const loadPlotly = async () => {
  if (plotlyModule) return plotlyModule;
  if (plotlyLoadPromise) return plotlyLoadPromise;
  
  plotlyLoadPromise = import('plotly.js-dist').then((module) => {
    plotlyModule = module.default || module;
    return plotlyModule;
  });
  
  return plotlyLoadPromise;
};

/**
 * 통합 Plotly 차트 컴포넌트
 * 
 * @param {string} chartId - 고유한 차트 ID
 * @param {string} title - 차트 제목
 * @param {Array} traces - Plotly traces 배열
 * @param {boolean} loading - 데이터 로딩 상태
 * @param {string|Error} error - 에러 메시지 또는 에러 객체
 * @param {Object} xAxis - X축 설정 { title, tickformat }
 * @param {Object} yAxis - Y축 설정 { title, tickformat }
 * @param {Object} layout - 추가 레이아웃 설정
 * @param {Object} config - Plotly 설정 옵션
 * @param {string} height - 차트 높이 (기본: '400px')
 * @param {Object} student - 학생 정보 (이미지 저장용)
 * @param {Object} assignment - 과제 정보 (이미지 저장용)
 * @param {string} chartType - 차트 타입 (이미지 저장용)
 * @param {boolean} showLegend - 범례 표시 여부 (기본: true)
 * @param {string|Array} syncWith - 동기화할 다른 차트 ID들 (X축 연동)
 * @param {Object} syncEvents - 차트 동기화 이벤트 객체 (chartSyncEvents)
 * @param {React.ReactNode} children - 추가 요소들
 */
const PlotlyChart = ({
  chartId,
  title,
  traces = [],
  loading = false,
  error = null,
  xAxis = {},
  yAxis = {},
  layout = {},
  config = {},
  height = '400px',
  student = null,
  assignment = null,
  chartType = 'chart',
  showLegend = true,
  syncWith = null,
  syncEvents = null,
  children
}) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef(null);
  const [plotlyLoaded, setPlotlyLoaded] = useState(!!plotlyModule);
  const [plotlyError, setPlotlyError] = useState(null);
  const [chartError, setChartError] = useState(null);

  // Plotly 로드
  useEffect(() => {
    let isMounted = true;
    
    const initPlotly = async () => {
      try {
        await loadPlotly();
        if (isMounted) {
          setPlotlyLoaded(true);
          setPlotlyError(null);
        }
      } catch (err) {
        console.error('Plotly 로드 실패:', err);
        if (isMounted) {
          setPlotlyError('차트 라이브러리 로드에 실패했습니다.');
        }
      }
    };

    if (!plotlyModule) {
      initPlotly();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 차트 스타일 메모이제이션
  const chartStyles = useMemo(() => getChartStyles(isDarkMode), [isDarkMode]);

  // 레이아웃 메모이제이션
  const chartLayout = useMemo(() => {
    const baseLayout = {
      title: title,
      font: chartStyles.font,
      paper_bgcolor: chartStyles.paper_bgcolor,
      plot_bgcolor: chartStyles.plot_bgcolor,
      margin: { t: 50, r: 30, b: 60, l: 80 },
      hovermode: 'x unified',
      showlegend: showLegend,
      legend: showLegend ? chartStyles.legend : undefined,
      xaxis: {
        title: xAxis.title || '시간',
        gridcolor: chartStyles.gridcolor,
        zerolinecolor: chartStyles.zerolinecolor,
        ...chartStyles.axis,
        tickformat: xAxis.tickformat || '%Y-%m-%d %H:%M',
        tickformatstops: getTimeFormatStops(),
        ...xAxis
      },
      yaxis: {
        title: yAxis.title || '값',
        gridcolor: chartStyles.gridcolor,
        zerolinecolor: chartStyles.zerolinecolor,
        ...chartStyles.axis,
        tickformat: yAxis.tickformat || ',d',
        ...yAxis
      },
      ...layout
    };

    // title을 layout에서 제거하여 중복 방지
    delete baseLayout.title;
    if (title) {
      baseLayout.title = {
        text: title,
        font: chartStyles.font,
        x: 0.5,
        xanchor: 'center'
      };
    }

    return baseLayout;
  }, [title, chartStyles, xAxis, yAxis, layout, showLegend]);

  // 차트 설정 메모이제이션
  const chartConfig = useMemo(() => ({
    responsive: true,
    displayModeBar: true,
    scrollZoom: true,
    modeBarButtonsToAdd: ['resetScale2d'],
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
    displaylogo: false,
    showTips: false,
    toImageButtonOptions: getImageSaveOptions(student, assignment, chartType),
    ...config
  }), [student, assignment, chartType, config]);

  // 트레이스 처리 메모이제이션
  const processedTraces = useMemo(() => {
    if (!traces || !Array.isArray(traces) || traces.length === 0) {
      return [];
    }

    return traces.map(trace => {
      const updatedTrace = { ...trace };
      
      // 기본 툴팁 설정
      if (!updatedTrace.hovertemplate) {
        if (trace.name && trace.name.includes('추가')) {
          updatedTrace.hovertemplate = getHoverTemplate('addition', true);
        } else if (trace.name && trace.name.includes('삭제')) {
          updatedTrace.hovertemplate = getHoverTemplate('deletion', true);
        } else if (trace.name && trace.name.includes('크기')) {
          updatedTrace.hovertemplate = getHoverTemplate('totalSize', true);
        } else {
          updatedTrace.hovertemplate = getHoverTemplate('default', true);
        }
      }
      
      return updatedTrace;
    });
  }, [traces]);

  // 빈 차트 생성
  const createEmptyChart = useCallback(async (message = '데이터가 없습니다') => {
    if (!plotlyModule) return;

    const emptyTrace = {
      x: [],
      y: [],
      type: 'scatter',
      mode: 'lines+markers',
      name: '데이터 없음'
    };

    const emptyLayout = {
      ...chartLayout,
      annotations: [{
        text: message,
        showarrow: false,
        font: {
          family: chartStyles.font.family,
          size: 14,
          color: chartStyles.font.color
        },
        x: 0.5,
        y: 0.5,
        xref: 'paper',
        yref: 'paper'
      }]
    };

    try {
      await plotlyModule.newPlot(chartId, [emptyTrace], emptyLayout, chartConfig);
    } catch (err) {
      console.error('빈 차트 생성 실패:', err);
    }
  }, [chartId, chartLayout, chartConfig, chartStyles]);

  // 차트 생성/업데이트
  useEffect(() => {
    if (!plotlyLoaded || !plotlyModule || loading) return;

    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    // 에러가 있는 경우
    if (error || plotlyError) {
      const errorMessage = error?.message || error || plotlyError;
      setChartError(errorMessage);
      createEmptyChart(`오류: ${errorMessage}`);
      return;
    }

    // 유효한 데이터가 없는 경우
    if (processedTraces.length === 0) {
      setChartError('데이터가 없습니다');
      createEmptyChart('해당 기간에 데이터가 없습니다');
      return;
    }

    // 차트 생성
    const createChart = async () => {
      try {
        await plotlyModule.newPlot(chartId, processedTraces, chartLayout, chartConfig);
        setChartError(null);
        
        // 차트 동기화 설정
        if (syncWith && syncEvents) {
          const syncTargets = Array.isArray(syncWith) ? syncWith : [syncWith];
          
          // plotly_relayout 이벤트 리스너 추가
          chartElement.on('plotly_relayout', function(eventData) {
            // 이미 동기화 중이면 무시
            if (syncEvents.isSyncing) return;
            
            // 디바운스 적용
            if (syncEvents.debounceTimeout) {
              clearTimeout(syncEvents.debounceTimeout);
            }
            
            syncEvents.debounceTimeout = setTimeout(() => {
              if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
                try {
                  // 동기화 상태 설정
                  syncEvents.isSyncing = true;
                  
                  // xAxis 범위 업데이트 이벤트 발생
                  syncEvents.xAxisUpdate = {
                    source: chartId,
                    range: [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']]
                  };
                  
                  // 동기화 대상 차트들 업데이트
                  syncTargets.forEach(targetChartId => {
                    if (targetChartId !== chartId) {
                      const targetElement = document.getElementById(targetChartId);
                      if (targetElement && syncEvents.xAxisUpdate.source !== targetChartId) {
                        plotlyModule.relayout(targetChartId, {
                          'xaxis.range[0]': eventData['xaxis.range[0]'],
                          'xaxis.range[1]': eventData['xaxis.range[1]']
                        });
                      }
                    }
                  });
                  
                  // 동기화 완료 후 상태 해제
                  setTimeout(() => {
                    syncEvents.isSyncing = false;
                  }, 100);
                } catch (err) {
                  console.error('차트 동기화 오류:', err);
                  syncEvents.isSyncing = false;
                }
              }
            }, 200); // 200ms 디바운스
          });
        }
        
      } catch (err) {
        console.error('차트 생성 오류:', err);
        setChartError(err.message || '차트 생성 중 오류가 발생했습니다');
        createEmptyChart('차트 생성 실패');
      }
    };

    createChart();

    // 클린업
    return () => {
      const chartDiv = document.getElementById(chartId);
      if (chartDiv && chartDiv._fullLayout) {
        try {
          plotlyModule.purge(chartId);
        } catch (err) {
          console.error('차트 정리 중 오류:', err);
        }
      }
    };
  }, [
    plotlyLoaded, 
    loading, 
    error, 
    plotlyError, 
    processedTraces, 
    chartLayout, 
    chartConfig, 
    chartId, 
    createEmptyChart,
    syncWith,
    syncEvents
  ]);

  // 로딩 상태
  if (!plotlyLoaded || loading) {
    return (
      <div style={{ width: '100%', height, position: 'relative' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Plotly 로드 에러
  if (plotlyError) {
    return (
      <div style={{ 
        width: '100%', 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ff5555',
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 85, 85, 0.1)',
        color: '#ff5555',
        fontFamily: chartStyles.font.family
      }}>
        {plotlyError}
      </div>
    );
  }

  return (
    <div className="plotly-chart-container" style={{ position: 'relative', width: '100%' }}>
      {/* 차트 에러 표시 */}
      {chartError && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 85, 85, 0.1)',
          border: '1px solid #ff5555',
          borderRadius: '4px',
          color: '#ff5555',
          fontSize: '12px',
          fontFamily: chartStyles.font.family,
          zIndex: 10,
          maxWidth: '200px'
        }}>
          {chartError}
        </div>
      )}
      
      {/* 차트 영역 */}
      <div
        id={chartId}
        ref={chartRef}
        style={{ width: '100%', height }}
      />
      
      {/* 추가 요소들 */}
      {children}
    </div>
  );
};

export default PlotlyChart; 