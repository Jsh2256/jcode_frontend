import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { routes, getDefaultRoute } from '../../routes';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../../contexts/ThemeContext';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { userService } from '../../services/api';
import { getAvatarUrl } from '../../utils/avatar';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRefs = useRef([]);
  const [activeButtonPos, setActiveButtonPos] = useState({ left: 0, width: 0 });
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isProfileSet, setIsProfileSet] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      
      try {
        const userData = await userService.getCurrentUser();
        const { studentNum, name } = userData;
        setIsProfileSet(Boolean(studentNum && name));
        setProfileData({ studentNum, name });
      } catch (error) {
        setIsProfileSet(false);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  const navItems = useMemo(() => {
    if (!user || !isProfileSet) return [];
    
    return routes
      .filter(route => 
        route.showInNav && 
        (!route.roles.length || route.roles.includes(user.role))
      )
      .sort((a, b) => a.order - b.order);
  }, [user, isProfileSet]);

  const isCurrentPath = (path) => {
    if (path.includes('/*')) {
      const basePath = path.replace('/*', '');
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  };

  useEffect(() => {
    const activeIndex = navItems.findIndex(route => 
      isCurrentPath(route.path)
    );
    
    if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
      const button = buttonRefs.current[activeIndex];
      const rect = button.getBoundingClientRect();
      const parentRect = button.parentElement.getBoundingClientRect();
      
      setActiveButtonPos({
        left: rect.left - parentRect.left,
        width: rect.width
      });
    } else {
      setActiveButtonPos({ left: 0, width: 0 });
    }
  }, [location.pathname, navItems]);

  if (loading || profileLoading) {
    return null;
  }

  const handleLogoClick = () => {
    const defaultRoute = getDefaultRoute(user?.role);
    navigate(defaultRoute);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleProfileSettings = () => {
    handleClose();
    navigate('/profile/settings');
  };

  const menuButtonStyle = {
    my: 2, 
    fontWeight: 'bold',
    fontSize: '1rem',
    mx: 1,
    color: 'text.primary',
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      backgroundColor: (theme) => theme.palette.action.hover,
      color: (theme) => theme.palette.primary.main
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileNavigation = (path) => {
    navigate(path.replace('/*', ''));
    handleMobileMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
      color: 'text.primary',
      boxShadow: 'none',
      borderBottom: 'none'
    }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 64 }}>
          <Box 
            component="div" 
            onClick={handleLogoClick}
            sx={{ 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={isDarkMode ? "/jcodeLogoDark-v1.png" : "/jcodeLogoLight-v1.png"}
                alt="JCode Logo"
                sx={{
                  height: 50,
                  mr: 1.5
                }}
              />
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{ 
                  mr: 2, 
                  fontWeight: 1000,
                  fontSize: '2rem',
                  letterSpacing: '-.05rem',
                  background: (theme) => 
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #FF79C6 40%, #BD93F9 90%)'
                      : `linear-gradient(45deg, ${theme.palette.primary.dark} 40%, ${theme.palette.primary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  WebkitTextStroke: (theme) => 
                    theme.palette.mode === 'dark'
                      ? '0.5px rgba(255, 121, 198, 0.3)'
                      : `0.5px ${theme.palette.primary.dark}`,
                  textShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px 2px 4px rgba(189, 147, 249, 0.4)'
                      : `2px 2px 4px ${theme.palette.primary.dark}35`,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }}
              >
                JCode
              </Typography>
            </Box>
          </Box>

          {user && (
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' },
                position: 'relative',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '22px',
                  left: 0,
                  height: '2px',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, #FF79C6, #BD93F9)'
                      : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 0 6px rgba(189, 147, 249, 0.3)'
                      : `0 0 6px ${theme.palette.primary.main}25`,
                  borderRadius: '4px',
                  width: `${activeButtonPos.width * 0.6}px`,
                  transform: `translateX(${activeButtonPos.left + (activeButtonPos.width * 0.2)}px)`,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, transparent, rgba(189, 147, 249, 0.2), transparent)'
                        : `linear-gradient(90deg, transparent, ${theme.palette.primary.main}15, transparent)`,
                  },
                  '@keyframes shimmer': {
                    '0%': {
                      transform: 'translateX(-100%)',
                    },
                    '100%': {
                      transform: 'translateX(100%)',
                    },
                  }
                }}
              />
              
              {navItems.map((route, index) => (
                <Button
                  key={route.path}
                  ref={el => buttonRefs.current[index] = el}
                  component={RouterLink}
                  to={route.path.replace('/*', '')}
                  sx={{
                    ...menuButtonStyle,
                    px: 2,
                    mx: 1,
                    '&::after': {
                      content: 'none'
                    }
                  }}
                >
                  {route.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user ? (
              <>
                <IconButton
                  onClick={handleProfileClick}
                  sx={{ p: 0.5 }}
                >
                  <Avatar 
                    src={getAvatarUrl(user.email)}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'transparent',
                      border: (theme) => `2px solid ${theme.palette.divider}`,
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        border: (theme) => `2px solid ${theme.palette.primary.main}`
                      }
                    }}
                  >
                    {user.email[0].toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: 'none',
                      border: (theme) => 
                        `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ 
                    px: 2.5, 
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar 
                      src={getAvatarUrl(user.email)}
                      sx={{ 
                        width: 40, 
                        height: 40,
                        background: 'transparent',
                        border: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? '2px solid #6272A4' 
                            : '2px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {user.email[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.8,
                        mb: 0.3
                      }}>
                        <Typography 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.95rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {profileData?.name || user.email.split('@')[0]}
                        </Typography>
                        <Typography 
                          component="span"
                          sx={{ 
                            px: 0.8,
                            py: 0.2,
                            borderRadius: '12px',
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(189, 147, 249, 0.1)' 
                                : 'rgba(33, 150, 243, 0.08)',
                            color: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '#FF79C6'
                                : '#1976D2',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {user.role === 'STUDENT' ? '학생' :
                           user.role === 'PROFESSOR' ? '교수' :
                           user.role === 'ASSISTANT' ? '조교' :
                           user.role === 'ADMIN' ? '관리자' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.2
                      }}>
                        <Typography 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {user.email}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            opacity: 0.8
                          }}
                        >
                          {profileData?.studentNum}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider />
                  <MenuItem 
                    onClick={handleProfileSettings}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover
                      }
                    }}
                  >
                    <Box
                      className="profile-icon"
                      sx={{
                        width: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <PersonIcon 
                        sx={{ 
                          fontSize: '20px',
                          color: (theme) => theme.palette.primary.main,
                          filter: (theme) => theme.palette.mode === 'dark'
                            ? 'drop-shadow(0 0 1px rgba(255, 121, 198, 0.3))'
                            : 'drop-shadow(0 0 1px rgba(25, 118, 210, 0.3))',
                        }} 
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        ml: 1,
                      }}
                    >
                      Profile
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={toggleDarkMode}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover
                      },
                      overflow: 'hidden',
                      height: '36px',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '28px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isDarkMode 
                            ? 'translateY(0) rotate(90deg)' 
                            : 'translateY(-20px) rotate(-90deg)',
                          opacity: isDarkMode ? 1 : 0,
                        }}
                      >
                        <DarkModeIcon 
                          sx={{ 
                            color: (theme) => theme.palette.primary.main,
                            fontSize: '20px',
                            filter: (theme) => theme.palette.mode === 'dark'
                              ? 'drop-shadow(0 0 2px rgba(189, 147, 249, 0.6))'
                              : 'none',
                          }} 
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isDarkMode 
                            ? 'translateY(20px) rotate(90deg)'
                            : 'translateY(0) rotate(0deg)',
                          opacity: isDarkMode ? 0 : 1,
                        }}
                      >
                        <LightModeIcon 
                          sx={{ 
                            color: (theme) => theme.palette.warning.main,
                            fontSize: '20px',
                            filter: (theme) => `drop-shadow(0 0 2px ${theme.palette.warning.light})`,
                          }} 
                        />
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        ml: 1,
                      }}
                    >
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover
                      }
                    }}
                  >
                    <Box
                      className="logout-icon"
                      sx={{
                        width: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <LogoutIcon 
                        sx={{ 
                          fontSize: '20px',
                          color: (theme) => theme.palette.error.main
                        }} 
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        ml: 1,
                      }}
                    >
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                onClick={login}
                sx={menuButtonStyle}
              >
                Login
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      
      {/* 모바일 메뉴 드로어 */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: '300px',
            boxSizing: 'border-box',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {user ? (
            <>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                mb: 2,
                pb: 2
              }}>
                <Avatar 
                  src={getAvatarUrl(user.email)}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    background: 'transparent',
                    border: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '2px solid #6272A4' 
                        : '2px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {user.email[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.8,
                    mb: 0.3
                  }}>
                    <Typography 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {profileData?.name || user.email.split('@')[0]}
                    </Typography>
                    <Typography 
                      component="span"
                      sx={{ 
                        px: 0.8,
                        py: 0.2,
                        borderRadius: '12px',
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? 'rgba(189, 147, 249, 0.1)' 
                            : 'rgba(33, 150, 243, 0.08)',
                        color: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '#FF79C6'
                            : '#1976D2',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {user.role === 'STUDENT' ? '학생' :
                       user.role === 'PROFESSOR' ? '교수' :
                       user.role === 'ASSISTANT' ? '조교' :
                       user.role === 'ADMIN' ? '관리자' : ''}
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <List sx={{ flexGrow: 1 }}>
                {navItems.map((route) => (
                  <ListItem key={route.path} disablePadding>
                    <ListItemButton
                      onClick={() => handleMobileNavigation(route.path)}
                      selected={isCurrentPath(route.path)}
                      sx={{
                        borderRadius: '8px',
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'dark' 
                              ? 'rgba(189, 147, 249, 0.1)' 
                              : 'rgba(33, 150, 243, 0.08)',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(189, 147, 249, 0.2)' 
                                : 'rgba(33, 150, 243, 0.12)',
                          }
                        }
                      }}
                    >
                      <ListItemText 
                        primary={route.label} 
                        primaryTypographyProps={{
                          fontWeight: isCurrentPath(route.path) ? 600 : 400,
                          color: isCurrentPath(route.path) 
                            ? 'primary.main' 
                            : 'text.primary'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 1 }} />

              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileSettings}>
                    <ListItemIcon>
                      <PersonIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Profile" 
                      primaryTypographyProps={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={toggleDarkMode}>
                    <ListItemIcon>
                      {isDarkMode ? (
                        <DarkModeIcon sx={{ color: 'primary.main' }} />
                      ) : (
                        <LightModeIcon sx={{ color: 'warning.main' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={isDarkMode ? "Dark Mode" : "Light Mode"} 
                      primaryTypographyProps={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={logout}>
                    <ListItemIcon>
                      <LogoutIcon sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Logout" 
                      primaryTypographyProps={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                onClick={() => {
                  login();
                  handleMobileMenuClose();
                }}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                로그인
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 