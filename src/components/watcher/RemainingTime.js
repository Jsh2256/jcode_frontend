import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT_FAMILY } from '../../constants/uiConstants';

const RemainingTime = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const difference = deadlineDate - now;

      // 마감 여부 상태 업데이트
      setIsExpired(difference <= 0);

      if (difference <= 0) {
        setTimeLeft('마감됨');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}일 `;
      if (hours > 0 || days > 0) timeString += `${hours}시간 `;
      if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}분 `;
      timeString += `${seconds}초`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]); // deadline이 변경될 때마다 useEffect 재실행

  // 라이트 모드에서 색상을 더 진하게 조정
  const getTimeColor = (remainingTime, isDarkMode) => {
    if (remainingTime < 0) {
      return isDarkMode ? '#ff5252' : '#d32f2f'; // 마감 후 - 더 진한 빨간색
    } else if (remainingTime < 24 * 60 * 60 * 1000) {
      return isDarkMode ? '#ff9800' : '#e65100'; // 24시간 미만 - 더 진한 주황색
    } else if (remainingTime < 3 * 24 * 60 * 60 * 1000) {
      return isDarkMode ? '#ffc107' : '#f57f17'; // 3일 미만 - 더 진한 노란색
    } else {
      return isDarkMode ? '#4caf50' : '#2e7d32'; // 3일 이상 - 더 진한 초록색
    }
  };

  return (
    <Typography
      sx={{ 
        fontFamily: FONT_FAMILY,
        color: getTimeColor(new Date(deadline) - new Date(), isDarkMode),
        fontWeight: 'medium'
      }}
    >
      {timeLeft}
    </Typography>
  );
};

export default RemainingTime; 