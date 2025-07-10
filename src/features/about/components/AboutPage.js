import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Link,
  Fade,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Divider,
  Collapse,
  Button,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArticleIcon from '@mui/icons-material/Article';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import UpdateIcon from '@mui/icons-material/Update';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BugReportIcon from '@mui/icons-material/BugReport';
import EnhancementIcon from '@mui/icons-material/AutoFixHigh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import jbnuLogo from '../../../assets/jbnulogopng.png';
import swunivLogo from '../../../assets/swunivlogopng.png';
import jedutoolsLogo from '../../../assets/jedutoolslogopng.png';
import litmusLogo from '../../../assets/Litmuslogosvg.svg';
import jcloudLogo from '../../../assets/jcloudlogosvg.svg';
import jflowLogo from '../../../assets/jflow-logo1.png';
import { keyframes } from '@mui/system';
import CIcon from '../../../assets/icons/cprogramming.svg';
import PythonIcon from '../../../assets/icons/python.svg';
import CppIcon from '../../../assets/icons/c++.svg';
import RouterIcon from '@mui/icons-material/Router';

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 패치노트 접기/펼치기 상태 관리
  const [expandedPatch, setExpandedPatch] = useState(0);
  const [expandAll, setExpandAll] = useState(false);
  // 모든 패치노트 표시 상태
  const [showAllPatches, setShowAllPatches] = useState(false);
  // 공지사항 더보기 상태 관리
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  const scroll = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-300px * 6)); }
  `;

  const partners = [
    { name: <img src={jcloudLogo} alt="JCloud" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://jcloud.jbnu.ac.kr' },
    { name: <img src={litmusLogo} alt="Litmus" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://litmus.jbnu.ac.kr' },
    { name: <img src={swunivLogo} alt="SW중심대학" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://swuniv.jbnu.ac.kr' },
    { name: <img src={jbnuLogo} alt="JBNU" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://www.jbnu.ac.kr' },
    { name: <img src={jedutoolsLogo} alt="JEduTools Portal" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://jedutools.jbnu.ac.kr' },
    { name: <img src={jflowLogo} alt="JFlow" style={{ height: '40px', width: '200px', objectFit: 'contain', filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}/>, url: 'https://jflow.jbnu.ac.kr' },
  ];

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: "Web IDE",
      description: "브라우저에서 바로 사용하는\n강력한 개발 환경"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Watcher",
      description: "실시간 활동 분석 및\n실시간 감시 시스템"
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: "Kubernetes",
      description: "안정적이고 확장 가능한\nKubernetes 기반 서비스"
    },
    {
      icon: <RouterIcon sx={{ fontSize: 40 }} />,
      title: "Proxy",
      description: "프록시 기반 라우팅으로\n안전하고 격리된 개발 환경"
    }
  ];

  const visionMission = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 40 }} />,
      title: "Mission",
      description: "모든 학생에게 접근성 높은 개발 환경을 제공하고,\n투명하고 공정한 코딩 문화를 만들어 나가는 것입니다."
    },
    {
      icon: <HandshakeIcon sx={{ fontSize: 40 }} />,
      title: "Vision",
      description: "학생들이 스스로 개발에 참여하고,\n실제 사용 경험을 바탕으로 자연스러운 혁신의 선순환을 이루어,\n모든 학습자에게 유익하고 활발한 교육 환경을\n제공하는 플랫폼으로 성장하는 것이 목표입니다."
    }
  ];

  const programmingLanguages = [
    { name: 'Python', icon: <img src={PythonIcon} alt="Python" style={{ width: '40px', height: '40px' }} />, description: '웹 개발\n데이터 분석 및 시각화\n머신러닝, 인공지능 및 과학 컴퓨팅'},
    { name: 'C', icon: <img src={CIcon} alt="C" style={{ width: '40px', height: '40px' }} />, description: '운영체제\n임베디드 시스템' },
    { name: 'C++', icon: <img src={CppIcon} alt="C++" style={{ width: '40px', height: '40px' }} />, description: '게임 개발 및 그래픽 프로그래밍\n데스크탑 애플리케이션 및 실시간 시스템' }
  ];

  const teamMembers = [
    {
      name: '박현찬',
      role: 'Professor',
    },
    {
      name: '김규호',
      role: 'Student',
    },
    {
      name: '김은혜',
      role: 'Student',
    },
    {
      name: '김진석',
      role: 'Student',
    },
    {
      name: '진순헌',
      role: 'Student',
    },
    {
      name: '허완',
      role: 'Student',
    }
  ];

  const timeline = [
    {
      date: '2020년 3월',
      title: 'JCode 출시',
      description: '웹 IDE 플랫폼 출시'
    },
    {
      date: '2020년 3월',
      title: 'Watcher 출시',
      description: '독립적인 Watcher 서비스 출시'
    },
    {
      date: '2024년 12월',
      title: 'JCode 통합 사이트 개발',
      description: 'JCode, Watcher 리뉴얼'
    },
    {
      date: '2025년 2월',
      title: 'Kubernetes 도입',
      description: 'Kubernetes를 통한 안정적인 서비스 운영'
    },
    {
      date: '2025년 3월',
      title: 'JCode 통합 사이트 출시',
      description: '데이터 시각화, 통계 기능 추가'
    }
  ];

  const guides = [
    {
      title: '[학생] JCode 사용법',
      description: 'Web IDE 사용법',
      link: 'https://jhelper.jbnu.ac.kr/JCode/1studentManual/1jcodeStudentManual'
    },
    {
      title: '[학생] Watcher 사용법',
      description: '통계 확인 및 일일 활동 분석',
      link: 'https://jhelper.jbnu.ac.kr/JCode/1studentManual/2watcherStudentManual'
    },
    {
      title: '[교수] JCode 사용법',
      description: '수업 생성 및 관리',
      link: 'https://jhelper.jbnu.ac.kr/JCode/2professorManual/1jcodeProfessorManual'
    },
    {
      title: '[교수] Watcher 사용법',
      description: '과제 생성, 학생 전체 통계',
      link: 'https://jhelper.jbnu.ac.kr/JCode/2professorManual/2watcherProfessorManual'
    }
  ];

    // badge가 LATEST인 경우 최신 버전 설정
    // type이 new인 경우 새로운 기능 추가
    // type이 enhancement인 경우 개선 사항 추가
    // type이 bug인 경우 버그 수정 추가
  const patchNotes = [
    {
      version: "1.1.0",
      date: "2025년 4월 27일",
      badge: "LATEST",
      notes: [
        { type: "new", text: "학생 전체 및 개인 차트 라이브러리 변경" },
        { type: "new", text: "학생 전체 차트 기간 설정 기능 추가" },
        { type: "enhancement", text: "개인 차트 성능 최적화" }
      ]
    }
  ];

  // 공지사항 데이터
  const announcements = [
    {
      id: 1,
      title: "v1.1.0 업데이트 안내",
      date: "2025-04-27",
      isNew: true,
      content: "차트 라이브러리를 변경하여 성능이 업그레이드되었습니다.\n버그 발견 시 바로 제보 부탁드립니다. (jedutools@gmail.com)"
    }
  ];

  // 패치노트 토글 함수
  const handleTogglePatch = (index) => {
    if (expandedPatch === index) {
      setExpandedPatch(-1);
    } else {
      setExpandedPatch(index);
    }
  };

  // 모든 패치노트 토글 함수
  const handleToggleAll = () => {
    setExpandAll(!expandAll);
    setExpandedPatch(-1);
  };

  // 모든 패치노트 표시 토글
  const handleToggleAllPatches = () => {
    setShowAllPatches(!showAllPatches);
    // 모든 패치노트를 표시할 때 첫 번째 패치노트만 펼치기
    if (!showAllPatches) {
      setExpandedPatch(0);
      setExpandAll(false);
    }
  };

  const SectionTitle = ({ children, smaller }) => (
    <Typography 
      variant="h4" 
      align="center"
      sx={{ 
        fontWeight: theme.typography.fontWeightBold,
        fontFamily: theme.typography.fontFamily,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`
          : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 6,
        fontSize: smaller ? '1.8rem' : undefined
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ pt: 8 }}>
          {/* 로고 섹션 */}
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main
                    : theme.palette.primary.dark,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: theme.typography.fontWeightBold,
                  letterSpacing: 1,
                  mb: 2
                }}
              >
                JCode
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: theme.typography.fontWeightMedium
                }}
              >
                클라우드 기반 웹 IDE 플랫폼
              </Typography>
            </motion.div>
          </Box>

          {/* 서비스 소개 섹션 */}
          <Box sx={{ mb: 12, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                  fontSize: '1.2rem', 
                  lineHeight: 1.8,
                  maxWidth: '800px',
                  margin: '0 auto',
                  mb: 4
                }}
              >
                JCode는 웹 기반 IDE와 통계 및 모니터링 기능을 제공하는 서비스입니다.
                <br />
                사용자는 별도의 설치 없이 웹 브라우저를 통해 언제 어디서나 접근할 수 있으며,
                <br /> 
                클라우드에서 최신 개발 환경을 손쉽게 이용할 수 있습니다.
              </Typography>
            </motion.div>
          </Box>

          {/* 공지사항 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Notice</SectionTitle>
            <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
              <Paper
                elevation={0}
                sx={{
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  background: theme.palette.mode === 'dark' 
                    ? theme.palette.background.paper
                    : theme.palette.background.default,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  }
                }}
              >
                <Box 
                  sx={{ 
                    p: { xs: 2, sm: 2.5 },
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <NotificationsIcon sx={{ 
                    color: theme.palette.primary.main, 
                    mr: 1.5,
                    fontSize: '1.4rem'
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    중요 공지사항
                  </Typography>
                </Box>
                
                <Divider />
                
                <List sx={{ p: 0 }}>
                  {(showAllAnnouncements ? announcements : announcements.slice(0, 1)).map((announcement, index) => (
                    <React.Fragment key={announcement.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ListItem 
                          alignItems="flex-start"
                          sx={{ 
                            p: 2.5,
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.03)' 
                                : 'rgba(0, 0, 0, 0.01)'
                            },
                            cursor: 'pointer'
                          }}
                        >
                          <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                            <EventNoteIcon sx={{ 
                              mt: 0.5,
                              mr: 2, 
                              color: theme.palette.text.secondary,
                              fontSize: '1.2rem'
                            }} />
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography 
                                    variant="subtitle1"
                                    sx={{ 
                                      fontWeight: 'medium',
                                      mr: 1,
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {announcement.title}
                                  </Typography>
                                  {announcement.isNew && (
                                    <FiberNewIcon 
                                      sx={{ 
                                        color: theme.palette.error.main,
                                        fontSize: '20px'
                                      }} 
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ 
                                      display: 'block',
                                      mb: 1,
                                      fontSize: '0.85rem',
                                      whiteSpace: 'pre-line'
                                    }}
                                  >
                                    {announcement.content}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.75rem' }}
                                  >
                                    {announcement.date}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                          </Box>
                        </ListItem>
                      </motion.div>
                      {index < (showAllAnnouncements ? announcements.length - 1 : 0) && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 'medium',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  {showAllAnnouncements ? '최신 공지사항만 보기' : '모든 공지사항 보기 →'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* 패치노트 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Release Notes</SectionTitle>
            
            {/* 패치노트 헤더 및 토글 버튼 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              maxWidth: '900px', 
              margin: '0 auto',
              mb: 3 
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  fontSize: '0.95rem'
                }}
              >
                {showAllPatches ? '전체 업데이트 정보' : '최신 업데이트 정보'}
              </Typography>
              {showAllPatches && (
                <Button 
                  variant="text" 
                  size="small"
                  onClick={handleToggleAll}
                  startIcon={expandAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 'medium',
                    fontSize: '0.85rem'
                  }}
                >
                  {expandAll ? '모두 접기' : '모두 펼치기'}
                </Button>
              )}
            </Box>
            
            {/* 패치노트 리스트 */}
            <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
              {/* 최신 패치노트만 보여주거나 모든 패치노트 표시 */}
              {(showAllPatches ? patchNotes : patchNotes.slice(0, 1)).map((patch, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 3,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: `4px solid ${
                      patch.badge === 'LATEST' 
                        ? '#00a94f'
                        : theme.palette.primary.main
                    }`,
                    borderRadius: theme.shape.borderRadius,
                    background: theme.palette.mode === 'dark' 
                      ? theme.palette.background.paper
                      : theme.palette.background.default,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: patch.badge === 'LATEST' 
                        ? '#00a94f'
                        : theme.palette.primary.main
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* 패치노트 헤더 */}
                    <Box 
                      sx={{ 
                        p: { xs: 2, sm: 2.5 },
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.02)'
                      }}
                      onClick={() => handleTogglePatch(showAllPatches ? index : 0)}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        minWidth: 0, // 이것이 플렉스 아이템이 축소되도록 허용
                        flex: 1
                      }}>
                        <UpdateIcon sx={{ 
                          color: patch.badge === 'LATEST' 
                            ? '#00a94f'
                            : theme.palette.primary.main, 
                          mr: 1.5,
                          fontSize: '1.4rem',
                          flexShrink: 0 // 아이콘은 축소되지 않도록
                        }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'nowrap',
                            mb: 0.5
                          }}>
                            {patch.badge && (
                              <Chip
                                label={patch.badge}
                                size="small"
                                sx={{
                                  height: '20px',
                                  bgcolor: '#00a94f',
                                  color: '#fff',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  mr: 1.2,
                                  '& .MuiChip-label': {
                                    px: 1,
                                    py: 0
                                  }
                                }}
                              />
                            )}
                            <Typography variant="h6" sx={{ 
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}>
                              {`v${patch.version}`}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {patch.date}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePatch(showAllPatches ? index : 0);
                        }}
                        sx={{ 
                          transition: 'transform 0.3s',
                          transform: (showAllPatches ? (expandedPatch === index) : (expandedPatch === 0)) || expandAll ? 'rotate(180deg)' : 'rotate(0deg)',
                          flexShrink: 0,
                          ml: 1
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                    
                    {/* 패치노트 내용 */}
                    <Collapse in={(showAllPatches ? (expandedPatch === index) : (expandedPatch === 0)) || expandAll}>
                      <Box sx={{ p: 3, pt: 1.5 }}>
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* 요약 통계 */}
                        <Box sx={{ 
                          display: 'flex', 
                          mb: 2.5,
                          gap: 2,
                          flexWrap: 'wrap'
                        }}>
                          <Chip 
                            icon={<NewReleasesIcon fontSize="small" />} 
                            label={`새로운 기능 ${patch.notes.filter(n => n.type === 'new').length}개`}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderColor: '#00a94f',
                              color: '#00a94f',
                              '& .MuiChip-icon': { 
                                color: '#00a94f'
                              }
                            }}
                          />
                          <Chip 
                            icon={<EnhancementIcon fontSize="small" />} 
                            label={`개선 사항 ${patch.notes.filter(n => n.type === 'enhancement').length}개`}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderColor: theme.palette.info.main,
                              color: theme.palette.info.main,
                              '& .MuiChip-icon': { 
                                color: theme.palette.info.main 
                              }
                            }}
                          />
                          <Chip 
                            icon={<BugReportIcon fontSize="small" />} 
                            label={`버그 수정 ${patch.notes.filter(n => n.type === 'bug').length}개`}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderColor: theme.palette.error.main,
                              color: theme.palette.error.main,
                              '& .MuiChip-icon': { 
                                color: theme.palette.error.main 
                              }
                            }}
                          />
                        </Box>
                        
                        {/* 패치노트 상세 내용 */}
                        <Box sx={{ pl: 1 }}>
                          {/* 새로운 기능 */}
                          {patch.notes.filter(n => n.type === 'new').length > 0 && (
                            <Box sx={{ mb: 2.5 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  color: '#00a94f',
                                  mb: 1
                                }}
                              >
                                <NewReleasesIcon sx={{ fontSize: '1rem', mr: 0.8 }} />
                                새로운 기능
                              </Typography>
                              {patch.notes.filter(n => n.type === 'new').map((note, noteIndex) => (
                                <Box key={noteIndex} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  ml: 2.2,
                                  mb: 1
                                }}>
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      width: 5, 
                                      height: 5, 
                                      borderRadius: '50%', 
                                      bgcolor: '#00a94f',
                                      mr: 1.5
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {note.text}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                          
                          {/* 개선 사항 */}
                          {patch.notes.filter(n => n.type === 'enhancement').length > 0 && (
                            <Box sx={{ mb: 2.5 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  color: theme.palette.info.main,
                                  mb: 1
                                }}
                              >
                                <EnhancementIcon sx={{ fontSize: '1rem', mr: 0.8 }} />
                                개선 사항
                              </Typography>
                              {patch.notes.filter(n => n.type === 'enhancement').map((note, noteIndex) => (
                                <Box key={noteIndex} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  ml: 2.2,
                                  mb: 1
                                }}>
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      width: 5, 
                                      height: 5, 
                                      borderRadius: '50%', 
                                      bgcolor: theme.palette.info.main,
                                      mr: 1.5
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {note.text}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                          
                          {/* 버그 수정 */}
                          {patch.notes.filter(n => n.type === 'bug').length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  color: theme.palette.error.main,
                                  mb: 1
                                }}
                              >
                                <BugReportIcon sx={{ fontSize: '1rem', mr: 0.8 }} />
                                버그 수정
                              </Typography>
                              {patch.notes.filter(n => n.type === 'bug').map((note, noteIndex) => (
                                <Box key={noteIndex} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  ml: 2.2,
                                  mb: 1
                                }}>
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      width: 5, 
                                      height: 5, 
                                      borderRadius: '50%', 
                                      bgcolor: theme.palette.error.main,
                                      mr: 1.5
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {note.text}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Collapse>
                  </motion.div>
                </Paper>
              ))}
              
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={handleToggleAllPatches}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 'medium',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  {showAllPatches ? '최신 업데이트만 보기' : '모든 업데이트 내역 보기 →'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* 미션 및 비전 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Goal</SectionTitle>
            <Grid container spacing={4}>
              {visionMission.map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: 250,
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Box>
                          <Box sx={{ 
                            color: theme.palette.mode === 'dark' 
                              ? '#FF79C6'
                              : theme.palette.primary.main,
                            mb: 1
                          }}>
                            {item.icon}
                          </Box>
                          <Typography variant="h6" sx={{ 
                            fontWeight: theme.typography.fontWeightBold,
                            color: theme.palette.text.primary,
                            fontFamily: theme.typography.fontFamily,
                            mb: 1
                          }}>
                            {item.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}>
                          {item.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 주요 기능 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Features</SectionTitle>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 4 }}>
                        <Box sx={{ 
                          color: theme.palette.mode === 'dark' 
                            ? '#FF79C6'
                            : theme.palette.primary.main,
                          mb: 2 
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: theme.typography.fontWeightBold,
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                        }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 사용 가이드 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Guide</SectionTitle>
            <Grid container spacing={3}>
              {guides.map((guide, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={guide.link}
                      underline="none"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'block' }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          background: theme.palette.mode === 'dark' 
                            ? theme.palette.background.paper
                            : theme.palette.background.default,
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.3s ease',
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[4],
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ArticleIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.2rem' }} />
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.95rem'
                            }}>
                              {guide.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{
                            fontSize: '0.85rem'
                          }}>
                            {guide.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 프로그래밍 언어 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Programming Languages</SectionTitle>
            <Grid container spacing={3}>
              {programmingLanguages.map((lang, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '160px',
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h2" sx={{ mr: 1, fontSize: '2rem' }}>
                              {lang.icon}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {lang.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-line'
                          }}>
                            {lang.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  fontSize: '0.9rem'
                }}
              >
                * 지속적인 업데이트를 통해 더 많은 프로그래밍 언어를 지원할 예정입니다.
              </Typography>
            </Box>
          </Box>

          {/* 팀 소개 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Development Team</SectionTitle>
            
            {/* 교수님 카드 */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    width: { xs: '100%', sm: '300px' },
                    background: theme.palette.mode === 'dark' 
                      ? theme.palette.background.paper
                      : theme.palette.background.default,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[4],
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        margin: '0 auto',
                        mb: 2,
                        border: `2px solid ${theme.palette.primary.main}`
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      박현찬
                    </Typography>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Professor
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
            
            {/* 학생 카드들 */}
            <Grid container spacing={3} justifyContent="center">
              {teamMembers.slice(1, 6).map((member, index) => (
                <Grid item xs={12} sm={6} md={3} lg={2.4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        background: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          src={member.avatar}
                          sx={{
                            width: 80,
                            height: 80,
                            margin: '0 auto',
                            mb: 2,
                            border: `2px solid ${theme.palette.primary.main}`
                          }}
                        />
                        <Typography variant="h6" gutterBottom>
                          {member.name}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {member.role}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            
            {/* 도움 주신 분들 섹션 */}
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 'medium',
                  mb: 3
                }}
              >
                Contributors
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  gap: 1.5,
                  maxWidth: '900px',
                  margin: '0 auto',
                  py: 2
                }}
              >
                {['김담은', '노형준', '이진규', '박은송'].map((name, index) => (
                  <Chip
                    key={index}
                    label={name}
                    variant="outlined"
                    sx={{
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      m: 0.7,
                      px: 1,
                      py: 2.5,
                      fontSize: '0.95rem',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <EmailIcon sx={{ color: theme.palette.primary.main }} /><Link href="https://mail.google.com/mail/?view=cm&fs=1&to=jedutools@gmail.com" target="_blank" rel="noopener noreferrer" sx={{ 
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}>jedutools@gmail.com</Link>
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mt: 1,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <LocationOnIcon /> 전북대학교 공과대학 7호관 619호 OSLAB
              </Typography>
            </Box>
          </Box>

          {/* 타임라인 섹션 */}
          <Box sx={{ mb: 12 }}>
            <SectionTitle>Project History</SectionTitle>
            <Box sx={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : index % 2 === 0 ? 'row' : 'row-reverse',
                      mb: 4,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: isMobile ? '20px' : '50%',
                        top: isMobile ? '40px' : 0,
                        bottom: '-20px',
                        width: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transform: isMobile ? 'none' : 'translateX(-50%)',
                        display: index === timeline.length - 1 ? 'none' : 'block'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: isMobile ? '100%' : '50%',
                        pr: isMobile ? 0 : index % 2 === 0 ? 4 : 0,
                        pl: isMobile ? 0 : index % 2 === 0 ? 0 : 4,
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main,
                          position: 'absolute',
                          top: '20px',
                          left: isMobile ? '11px' : index % 2 === 0 ? 'auto' : '-10px',
                          right: isMobile ? 'auto' : index % 2 === 0 ? '-10px' : 'auto',
                          zIndex: 1
                        }}
                      />
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          ml: isMobile ? 5 : 0,
                          background: theme.palette.mode === 'dark' 
                            ? theme.palette.background.paper
                            : theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[4],
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <Typography variant="subtitle2" color="primary">
                          {item.date}
                        </Typography>
                        <Typography variant="h6" sx={{ my: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Related Sites 섹션 */}
          <Box sx={{ 
            position: 'relative',
            width: '100vw',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            background: theme.palette.mode === 'dark' 
              ? theme.palette.background.default
              : theme.palette.background.paper,
            py: 6,
            overflow: 'hidden'
          }}>
            <Container maxWidth="lg" sx={{ mb: 3 }}>
              <SectionTitle smaller>Family Sites</SectionTitle>
            </Container>
            
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              <Box sx={{
                display: 'flex',
                width: 'max-content',
                animation: `${scroll} 40s linear infinite`,
                '&:hover': {
                  animationPlayState: 'paused'
                },
                gap: '30px'
              }}>
                {[...partners, ...partners].map((partner, index) => (
                  <Link
                    key={index}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '15px',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.background.paper
                        : theme.palette.background.default,
                      borderRadius: theme.shape.borderRadius,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    {partner.name}
                  </Link>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default AboutPage; 