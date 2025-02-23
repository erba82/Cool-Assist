import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FlowDiagramTool: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Flow Diagram Tool
        </Typography>
        <Typography variant="body1">
          Flow diagram drawing tool will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default FlowDiagramTool;