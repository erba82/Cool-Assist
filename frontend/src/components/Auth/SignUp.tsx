// src/components/Auth/SignUp.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { authService } from '../../services/auth/authService';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await authService.signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Redirect to dashboard
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        fullWidth
        label="Email"
        type="email"
        required
        margin="normal"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      
      {/* Additional fields */}
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Button
        fullWidth
        variant="outlined"
        onClick={() => authService.signInWithGoogle()}
      >
        Sign up with Google
      </Button>
    </Box>
  );
};

export default SignUp;