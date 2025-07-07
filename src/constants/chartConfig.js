/**
 * 차트 관련 상수와 설정
 */

// Dracula Theme Colors (theme.js와 동일)
export const CHART_COLORS = {
  dark: {
    background: '#282A36',
    currentLine: '#44475A',
    foreground: '#F8F8F2',
    comment: '#6272A4',
    purple: '#BD93F9',
    purpleHover: '#A77BF3',
    pink: '#FF79C6',
    red: '#FF5555',
    orange: '#FFB86C',
    yellow: '#F1FA8C',
    green: '#50FA7B',
    cyan: '#8BE9FD',
    selection: 'rgba(189, 147, 249, 0.3)',
    hover: 'rgba(189, 147, 249, 0.08)',
  },
  light: {
    background: '#FFFFFF',
    currentLine: '#FFFFFF',
    foreground: '#282A36',
    comment: '#44475A',
    purple: '#6272A4',
    purpleHover: '#4E5C8E',
    hover: 'rgba(98, 114, 164, 0.08)',
  }
};

// 폰트 설정
export const CHART_FONT_FAMILY = "'JetBrains Mono', 'Noto Sans KR', sans-serif";

// 기본 차트 옵션
export const DEFAULT_CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  displayModeBar: false,
  scrollZoom: true,
  doubleClick: 'reset',
};

// Plotly 차트 저장 옵션
export const CHART_SAVE_OPTIONS = {
  format: 'png',
  height: 800,
  width: 1200,
  scale: 2
}; 