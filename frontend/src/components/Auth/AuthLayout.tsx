import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const AuthLayout: React.FC = () => {
  const location = useLocation();
  // حالا state.auth وجود دارد
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // اگر در صفحه splash هستیم، فقط محتوا نمایش داده شود
  if (location.pathname === '/splash') {
    return <Outlet />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;