import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  MenuItem,
} from '@mui/material';

const ElectricalCalculator: React.FC = () => {
  const [calculationType, setCalculationType] = useState<string>('power');
  const [voltage, setVoltage] = useState<string>('');
  const [current, setCurrent] = useState<string>('');
  const [power, setPower] = useState<string>('');

  const calculationTypes = [
    { value: 'power', label: 'Power (W = V × A)' },
    { value: 'current', label: 'Current (A = W ÷ V)' },
    { value: 'voltage', label: 'Voltage (V = W ÷ A)' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Electrical Calculator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Calculation Type"
              value={calculationType}
              onChange={(e) => setCalculationType(e.target.value)}
            >
              {calculationTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Voltage (V)"
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              disabled={calculationType === 'voltage'}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Current (A)"
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              disabled={calculationType === 'current'}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Power (W)"
              type="number"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              disabled={calculationType === 'power'}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ElectricalCalculator;