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
  Button,
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import RouterIcon from '@mui/icons-material/Router';
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

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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



  // 공지사항 데이터
  const announcements = [
    {
      id: 1,
      title: "v1.2.0 업데이트 안내",
      date: "2025-07-29",
      isNew: true,
      type: "update",
      content: "대규모 아키텍쳐 리팩토링 및 페이지네이션 기능 추가"
    },
    {
      id: 2,
      title: "v1.1.0 업데이트 안내",
      date: "2025-04-27",
      isNew: false,
      type: "update",
      content: "차트 라이브러리를 변경하여 성능이 업그레이드되었습니다."
    },
    {
      id: 3,
      title: "시스템 점검 안내",
      date: "2025-01-15",
      isNew: false,
      type: "maintenance",
      content: "1월 20일 오전 2시-4시 시스템 점검이 예정되어 있습니다."
    }
  ];



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
            
            <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    minHeight: '400px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark' 
                      ? theme.palette.background.paper
                      : theme.palette.background.default,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 3,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(25, 118, 210, 0.1)' 
                        : 'rgba(25, 118, 210, 0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <NotificationsIcon sx={{ 
                        color: theme.palette.primary.main,
                        fontSize: '1.5rem'
                      }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.primary.main
                        }}
                      >
                        공지사항
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    {(showAllAnnouncements ? announcements : announcements.slice(0, 3)).map((announcement, index) => (
                      <Box 
                        key={announcement.id}
                        sx={{ 
                          mb: index === (showAllAnnouncements ? announcements.length - 1 : Math.min(announcements.length, 3) - 1) ? 0 : 3,
                          pb: index === (showAllAnnouncements ? announcements.length - 1 : Math.min(announcements.length, 3) - 1) ? 0 : 3,
                          borderBottom: index === (showAllAnnouncements ? announcements.length - 1 : Math.min(announcements.length, 3) - 1) ? 'none' : `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: announcement.type === 'update' ? theme.palette.success.main : theme.palette.warning.main,
                            mt: 1,
                            flexShrink: 0
                          }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography 
                                variant="subtitle1"
                                sx={{ 
                                  fontWeight: 'medium',
                                  fontSize: '0.95rem'
                                }}
                              >
                                {announcement.title}
                              </Typography>
                              {announcement.isNew && (
                                <Box sx={{
                                  px: 1,
                                  py: 0.2,
                                  backgroundColor: theme.palette.error.main,
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  lineHeight: 1
                                }}>
                                  NEW
                                </Box>
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ 
                                mb: 1,
                                fontSize: '0.85rem',
                                lineHeight: 1.5
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
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {showAllAnnouncements ? '접기' : '더보기'}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
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