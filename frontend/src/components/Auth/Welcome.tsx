// src/components/Auth/Welcome.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const LogoContainer = styled(motion.div)`
  width: 200px;
  height: 200px;
  margin: 0 auto;
`;

const WelcomePage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center',
        }}
      >
        <LogoContainer
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.5
          }}
        >
          <img src="/logo.png" alt="Cool-Assist Logo" style={{ width: '100%' }} />
        </LogoContainer>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Cool-Assist
          </Typography>
          <Typography variant="h6" color="textSecondary" align="center">
            Your Intelligent HVAC & Refrigeration Assistant
          </Typography>
        </motion.div>
      </Box>
    </Container>
  );
};

export default WelcomePage;