import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';

type UnitType = 'temperature' | 'pressure' | 'length' | 'weight';

const UnitConverter: React.FC = () => {
  const [unitType, setUnitType] = useState<UnitType>('temperature');
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');

  const unitTypes = {
    temperature: ['°C', '°F', 'K'],
    pressure: ['kPa', 'bar', 'psi'],
    length: ['m', 'ft', 'inch'],
    weight: ['kg', 'lb', 'g'],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Unit Converter
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Conversion Type"
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as UnitType)}
            >
              {Object.keys(unitTypes).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Value"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="From Unit"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {unitTypes[unitType].map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="To Unit"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
            >
              {unitTypes[unitType].map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UnitConverter;