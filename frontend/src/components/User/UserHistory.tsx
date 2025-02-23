import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const UserHistory: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          User History
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Calculator Usage"
              secondary="Temperature conversion from 20°C to 68°F - 2025-02-23"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Refrigerant Calculation"
              secondary="R-410A pressure/temperature calculation - 2025-02-23"
            />
          </ListItem>
          {/* Add more history items as needed */}
        </List>
      </Paper>
    </Box>
  );
};

export default UserHistory;