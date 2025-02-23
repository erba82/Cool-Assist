import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';

interface Refrigerant {
  name: string;
  code: string;
}

const RefrigerantCalculator: React.FC = () => {
  const [refrigerant, setRefrigerant] = useState<string>('');
  const [pressure, setPressure] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');

  const refrigerants: Refrigerant[] = [
    { name: 'R-22', code: 'R22' },
    { name: 'R-134a', code: 'R134a' },
    { name: 'R-410A', code: 'R410A' },
    { name: 'R-32', code: 'R32' },
    // Add more refrigerants as needed
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Refrigerant Calculator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Refrigerant"
              value={refrigerant}
              onChange={(e) => setRefrigerant(e.target.value)}
            >
              {refrigerants.map((ref) => (
                <MenuItem key={ref.code} value={ref.code}>
                  {ref.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pressure (bar)"
              type="number"
              value={pressure}
              onChange={(e) => setPressure(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Temperature (°C)"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RefrigerantCalculator;