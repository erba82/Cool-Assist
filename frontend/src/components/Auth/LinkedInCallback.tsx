import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Paper, LinearProgress } from '@mui/material';
import { AuthService } from '../../services/authService';
import { LinkedInAIService } from '../../services/ai/LinkedInAIService';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface ProcessStatus {
  auth: 'pending' | 'complete' | 'error';
  aiInit: 'pending' | 'complete' | 'error';
  profile: 'pending' | 'complete' | 'error';
}

const LinkedInCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessStatus>({
    auth: 'pending',
    aiInit: 'pending',
    profile: 'pending'
  });
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        if (!code || !state) {
          throw new Error('Invalid callback parameters');
        }
        setProgress(20);
        const user = await AuthService.handleLinkedInCallback(code, state);
        setStatus(prev => ({ ...prev, auth: 'complete' }));
        setProgress(40);
        const aiService = LinkedInAIService.getInstance();
        if (!user.linkedInAccessToken) {
          throw new Error('Missing LinkedIn access token');
        }
        await aiService.initializeAILearning(user.linkedInAccessToken);
        setStatus(prev => ({ ...prev, aiInit: 'complete' }));
        setProgress(70);
        await AuthService.updateUserProfile(user.id);
        setStatus(prev => ({ ...prev, profile: 'complete' }));
        setProgress(100);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setStatus({ auth: 'error', aiInit: 'error', profile: 'error' });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };
    handleCallback();
  }, [location, navigate]);

  const renderStatus = (label: string, status: 'pending' | 'complete' | 'error') => {
    let color: 'primary' | 'success' | 'error' = 'primary';
    let message = 'In Progress...';
    switch (status) {
      case 'complete':
        color = 'success';
        message = 'Complete';
        break;
      case 'error':
        color = 'error';
        message = 'Failed';
        break;
    }
    return (
      <Typography variant="body2" color={color}>
        {label}: {message}
      </Typography>
    );
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        LinkedIn Authentication
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress size={40} sx={{ mb: 3 }} />
          <ProgressContainer>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5 }} />
            <Box sx={{ mt: 2 }}>
              {renderStatus('Authentication', status.auth)}
              {renderStatus('AI Initialization', status.aiInit)}
              {renderStatus('Profile Processing', status.profile)}
            </Box>
          </ProgressContainer>
          <Typography variant="body1" color="text.secondary">
            Please wait while we complete your LinkedIn authentication...
          </Typography>
        </>
      )}
    </StyledPaper>
  );
};

export default LinkedInCallback;