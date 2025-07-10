import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Typography,
  Container,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { ProfileSetup } from '../../auth';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../services/api';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { getAvatarUrl, getRandomStyle } from '../../../utils/avatar';
import { LoadingSpinner } from '../../../components/ui';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3,
    p: 2,
    borderRadius: '12px',
    backgroundColor: (theme) => 
      theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.3s ease',
    border: (theme) =>
      `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
    '&:hover': {
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.04)',
      transform: 'translateY(-2px)',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? '#6272A4' : '#BDBDBD',
    }
  }}>
    <Box sx={{ 
      mr: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: '12px',
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(25, 118, 210, 0.1)',
    }}>
      {icon}
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '미설정'}
      </Typography>
    </Box>
  </Box>
);

const ProfileSettings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const avatarStyles = [
    'adventurer',
    'adventurer-neutral',
    'avataaars',
    'big-ears',
    'big-ears-neutral',
    'big-smile',
    'bottts',
    'croodles',
    'croodles-neutral',
    'fun-emoji',
    'icons',
    'identicon',
    'initials',
    'lorelei',
    'lorelei-neutral',
    'micah',
    'miniavs',
    'open-peeps',
    'personas',
    'pixel-art',
    'pixel-art-neutral'
  ];

  const randomStyle = getRandomStyle();

  const avatarUrl = getAvatarUrl(user?.email);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await userService.getCurrentUser();
        setProfileData(data);
      } catch (error) {
        console.error('프로필 정보 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleRandomAvatar = () => {
    // This function is no longer used in the component
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return <LoadingSpinner sx={{ mt: 12, mb: 4 }} />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
      <Paper elevation={0} sx={{ 
        borderRadius: '16px',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            aria-label="프로필 설정 탭"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 500,
                py: 2,
              }
            }}
          >
            <Tab label="내 정보" />
            <Tab label="내 정보 수정" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4
            }}>
              <Avatar 
                src={avatarUrl}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mb: 2,
                  fontSize: profileData?.name?.length > 2 ? '2rem' : '2.5rem',
                  border: (theme) => 
                    `2px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
                  backgroundColor: 'transparent'
                }}
              >
                {profileData?.name?.[0] || user?.email?.[0].toUpperCase()}
              </Avatar>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {profileData?.name ? `${profileData.name}님의 프로필` : '내 프로필'}
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
              <InfoItem 
                icon={<EmailIcon color="primary" />} 
                label="이메일" 
                value={user?.email} 
              />
              <InfoItem 
                icon={<BadgeIcon color="primary" />} 
                label="이름" 
                value={profileData?.name} 
              />
              <InfoItem 
                icon={<SchoolIcon color="primary" />} 
                label="학번" 
                value={profileData?.studentNum} 
              />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <ProfileSetup isEditMode={true} initialData={profileData} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfileSettings; 