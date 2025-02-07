import React, { useState, useCallback, useMemo } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { HVACCalculations } from '../../services/calculations/HVACCalculations';
import { ErrorHandler } from '../../services/errorHandling/ErrorHandler';
import { useTheme } from '@mui/material/styles';

interface RoomData {
  length: string;
  width: string;
  height: string;
  occupants: string;
  windows: string;
  outsideTemp: string;
  desiredTemp: string;
  humidity: string;
  buildingType: string;
}

interface CalculationResult {
  coolingLoad: number;
  heatingLoad: number;
  ventilationRate: number;
  dehumidification: number;
  recommendedSystem: string;
}

export const HVACCalculator: React.FC = () => {
  const theme = useTheme();
  const [inputs, setInputs] = useState<RoomData>({
    length: '',
    width: '',
    height: '',
    occupants: '',
    windows: '',
    outsideTemp: '',
    desiredTemp: '',
    humidity: '',
    buildingType: 'residential'
  });
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = useCallback(() => {
    const numericInputs = Object.entries(inputs).filter(([key]) => key !== 'buildingType');
    for (const [key, value] of numericInputs) {
      if (!value) {
        throw new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid value for ${key}`);
      }
      if (numValue < 0) {
        throw new Error(`${key} cannot be negative`);
      }
    }

    return {
      length: parseFloat(inputs.length),
      width: parseFloat(inputs.width),
      height: parseFloat(inputs.height),
      occupants: parseInt(inputs.occupants),
      windows: parseInt(inputs.windows),
      outsideTemp: parseFloat(inputs.outsideTemp),
      desiredTemp: parseFloat(inputs.desiredTemp),
      humidity: parseFloat(inputs.humidity),
      buildingType: inputs.buildingType
    };
  }, [inputs]);

  const calculateResults = useCallback(async () => {
    try {
      const validatedInputs = validateInputs();
      
      const hvacService = new HVACCalculations();
      const calculations = await hvacService.calculateLoads({
        ...validatedInputs,
        area: validatedInputs.length * validatedInputs.width,
        volume: validatedInputs.length * validatedInputs.width * validatedInputs.height
      });

      setResults(calculations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
      ErrorHandler.handleError(err as Error, 'HVACCalculator');
    }
  }, [validateInputs]);
  const handleTextFieldChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target;
    if (name) {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSelectChange = (event: SelectChangeEvent<string>, child?: React.ReactNode) => {
    const { name, value } = event.target;
    if (name) {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resultCards = useMemo(() => {
    if (!results) return null;

    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary">Cooling Load</Typography>
              <Typography variant="h4">{results.coolingLoad.toFixed(2)} kW</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary">Heating Load</Typography>
              <Typography variant="h4">{results.heatingLoad.toFixed(2)} kW</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary">Ventilation Rate</Typography>
              <Typography variant="h4">{results.ventilationRate.toFixed(2)} m³/h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary">Recommended System</Typography>
              <Typography variant="body1">{results.recommendedSystem}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }, [results]);

  return (
    <div>
      <Typography variant="h4" gutterBottom color="primary">
        HVAC Load Calculator
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
                            fullWidth
                            label="Length (m)"
                            name="length"
                            value={inputs.length}
                            onChange={handleTextFieldChange}
                            type="number"
                            margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Width (m)"
              name="width"
              value={inputs.width}
              onChange={handleTextFieldChange}
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Height (m)"
              name="height"
              value={inputs.height}
              onChange={handleTextFieldChange}
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Outside Temperature (°C)"
              name="outsideTemp"
              value={inputs.outsideTemp}
              onChange={handleTextFieldChange}
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Desired Temperature (°C)"
              name="desiredTemp"
              value={inputs.desiredTemp}
              onChange={handleTextFieldChange}
              type="number"
              margin="normal"
            />
          </Grid>
              </Grid>
            </CardContent>
          </Card>
                <TextField
                                  fullWidth
                                  label="Number of Occupants"
                                  name="occupants"
                                  value={inputs.occupants}
                                  onChange={handleTextFieldChange}
                                  type="number"
                                  margin="normal"
                                />
                  label="Number of Occupants"
                  name="occupants"
                <TextField
                                  fullWidth
                                  label="Number of Windows"
                                  name="windows"
                                  value={inputs.windows}
                                  onChange={handleTextFieldChange}
                                  type="number"
                                  margin="normal"
                                />
                  label="Number of Windows"
                  name="windows"
                <TextField
                                  fullWidth
                                  label="Humidity (%)"
                                  name="humidity"
                                  value={inputs.humidity}
                                  onChange={handleTextFieldChange}
                                  type="number"
                                  margin="normal"
                                />
                  <Select
                                      name="buildingType"
                                      value={inputs.buildingType}
                                      onChange={handleSelectChange}
                                      label="Building Type"
                                    >
                                      <MenuItem value="residential">Residential</MenuItem>
                                      <MenuItem value="commercial">Commercial</MenuItem>
                                      <MenuItem value="industrial">Industrial</MenuItem>
                                    </Select>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={calculateResults}
        sx={{ mt: 3, mb: 2 }}
        size="large"
      >
        Calculate HVAC Loads
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {resultCards}
    </div>
  );
};

export default HVACCalculator;
