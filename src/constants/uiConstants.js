// 폰트 패밀리 상수
export const FONT_FAMILY = "'JetBrains Mono', 'Noto Sans KR', sans-serif";
export const MONO_FONT_FAMILY = "'JetBrains Mono', monospace";

// 공통 스타일 객체
export const COMMON_STYLES = {
  fontFamily: FONT_FAMILY,
  monoFontFamily: MONO_FONT_FAMILY,
  
  // 중앙 정렬
  centerBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // 텍스트 스타일
  text: {
    fontFamily: FONT_FAMILY
  },
  
  monoText: {
    fontFamily: MONO_FONT_FAMILY
  },
  
  // 테이블 셀 기본 스타일
  tableCell: {
    fontFamily: FONT_FAMILY
  },
  
  tableCellBold: {
    fontFamily: FONT_FAMILY,
    fontWeight: 'bold'
  }
};

// sx prop용 헬퍼 함수들
export const createSxWithFont = (additionalStyles = {}) => ({
  fontFamily: FONT_FAMILY,
  ...additionalStyles
});

export const createMonoSxWithFont = (additionalStyles = {}) => ({
  fontFamily: MONO_FONT_FAMILY,
  ...additionalStyles
}); 