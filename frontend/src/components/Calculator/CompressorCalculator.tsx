import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { refrigerationCalculator, RefrigerationSystemParams, CompressorResults } from '../../utils/refrigerationCalculations';

const CompressorCalculator: React.FC = () => {
  const [params, setParams] = useState<RefrigerationSystemParams>({
    systemType: 'ammonia',
    refrigerantType: 'R717',
    capacity: 100,
    evaporatingTemp: -10,
    condensingTemp: 35,
    subcooling: 5,
    superheating: 5,
    compressorEfficiency: 0.75
  });

  const [results, setResults] = useState<CompressorResults | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  const handleCalculate = () => {
    const calculationResults = refrigerationCalculator.calculateCompressor(params);
    setResults(calculationResults);
    updateChart(calculationResults);
  };

  const updateChart = (results: CompressorResults) => {
    setChartData({
      labels: ['Suction', 'Discharge'],
      datasets: [
        {
          label: 'Pressure (bar)',
          data: [results.suctionPressure, results.dischargePressure],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Compressor Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>System Type</InputLabel>
              <Select
                value={params.systemType}
                onChange={(e) => setParams({ ...params, systemType: e.target.value as any })}
              >
                <MenuItem value="ammonia">Ammonia</MenuItem>
                <MenuItem value="freon">Freon</MenuItem>
                <MenuItem value="co2">CO2</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Cooling Capacity (kW)"
              type="number"
              value={params.capacity}
              onChange={(e) => setParams({ ...params, capacity: Number(e.target.value) })}
              fullWidth
            />
            
            <TextField
              label="Evaporating Temperature (°C)"
              type="number"
              value={params.evaporatingTemp}
              onChange={(e) => setParams({ ...params, evaporatingTemp: Number(e.target.value) })}
              fullWidth
            />
            
            {/* Add other parameter fields */}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {results && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Power Consumption</Typography>
                  <Typography>{results.power.toFixed(2)} kW</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">COP</Typography>
                  <Typography>{results.cop.toFixed(2)}</Typography>
                </Grid>
                {/* Add other result fields */}
              </Grid>

              {chartData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Pressure Analysis
                  </Typography>
                  <Line data={chartData} />
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCalculate}
          fullWidth
        >
          Calculate
        </Button>
      </Box>
    </Paper>
  );
};

export default CompressorCalculator;