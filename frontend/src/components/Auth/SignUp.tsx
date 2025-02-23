import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Google as GoogleIcon,
  LinkedIn as LinkedInIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
}));

const SocialButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
}));

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      setError(null);
      await AuthService.signUpWithEmail(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('SignUp error:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await AuthService.googleSignUp();
      // OAuth flow: redirect will occur
    } catch (err) {
      console.error('Google sign up error:', err);
      setError('Google sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await AuthService.signUpWithLinkedIn();
      // OAuth flow: redirect will occur
    } catch (err) {
      console.error('LinkedIn sign up error:', err);
      setError('LinkedIn sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Account
      </Typography>
      <Stack spacing={2}>
        <SocialButton
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          Continue with Google
        </SocialButton>
        <SocialButton
          variant="outlined"
          startIcon={<LinkedInIcon />}
          onClick={handleLinkedInSignUp}
          disabled={isLoading}
          sx={{
            color: '#0A66C2',
            borderColor: '#0A66C2',
            '&:hover': {
              borderColor: '#004182',
              backgroundColor: 'rgba(10, 102, 194, 0.04)',
            },
          }}
        >
          Continue with LinkedIn
        </SocialButton>
        <Divider>or</Divider>
        <Box component="form" onSubmit={handleEmailSignUp}>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isLoading}
            startIcon={<EmailIcon />}
          >
            Sign Up with Email
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Button variant="text" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </Typography>
      </Stack>
    </StyledPaper>
  );
};

export default SignUp;