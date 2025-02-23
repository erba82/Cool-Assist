import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';

const scaleUp = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth/login');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'rgb(0, 71, 171)', // رنگ آبی سلطنتی
      }}
    >
      <Box
        sx={{
          animation: `${scaleUp} 1.5s ease-out`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          src="/logo.png"
          alt="Cool-Assist Logo"
          style={{ width: '200px', marginBottom: '2rem' }}
        />
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Welcome to Cool-Assist HVACR AI
        </Typography>
      </Box>
    </Box>
  );
};

export default SplashScreen;