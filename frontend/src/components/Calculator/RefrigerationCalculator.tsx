import React, { useState, useCallback, useMemo } from 'react';
import { TextField, Button, Card, CardContent, Typography, Grid, Alert } from '@mui/material';
import { RefrigerantProperties } from '../../services/refrigerant/RefrigerantProperties';
import { ErrorHandler } from '../../services/errorHandling/ErrorHandler';

interface RefrigerationCalculatorProps {
  type?: 'ammonia' | 'freon' | 'co2';
}

interface CalculationResult {
  cop: number;
  capacity: number;
  powerInput: number;
  massFlow: number;
}

export const RefrigerationCalculator: React.FC<RefrigerationCalculatorProps> = ({ type }) => {
  const [inputs, setInputs] = useState({
    evaporatorTemp: '',
    condenserTemp: '',
    refrigerantType: type ? type.toUpperCase() : 'R134a',
    capacity: ''
  });
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = useCallback(() => {
    const { evaporatorTemp, condenserTemp, capacity } = inputs;
    if (!evaporatorTemp || !condenserTemp || !capacity) {
      throw new Error('All fields are required');
    }

    const evapTemp = parseFloat(evaporatorTemp);
    const condTemp = parseFloat(condenserTemp);
    const cap = parseFloat(capacity);

    if (isNaN(evapTemp) || isNaN(condTemp) || isNaN(cap)) {
      throw new Error('Invalid number format');
    }

    if (evapTemp >= condTemp) {
      throw new Error('Evaporator temperature must be lower than condenser temperature');
    }

    if (cap <= 0) {
      throw new Error('Capacity must be greater than 0');
    }

    return { evapTemp, condTemp, cap };
  }, [inputs]);

  const calculateResults = useCallback(async () => {
    try {
      const { evapTemp, condTemp, cap } = validateInputs();
      
      // Convert temperatures to absolute (Kelvin)
      const tevapK = evapTemp + 273.15;
      const tcondK = condTemp + 273.15;

      // Calculate Carnot COP
      const cop = tevapK / (tcondK - tevapK);

      // Get refrigerant properties
      const refrigerantProps = await RefrigerantProperties.getProperties(
        inputs.refrigerantType,
        evapTemp,
        condTemp
      );

      // Calculate actual system performance
      const actualCOP = cop * 0.6; // Assuming 60% of Carnot efficiency
      const powerInput = cap / actualCOP;
      const massFlow = cap / refrigerantProps.evaporatorEnthalpy;

      setResults({
        cop: actualCOP,
        capacity: cap,
        powerInput,
        massFlow
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
      ErrorHandler.handleError(err as Error, 'RefrigerationCalculator');
    }
  }, [inputs, validateInputs]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resultCards = useMemo(() => {
    if (!results) return null;

    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">COP</Typography>
              <Typography>{results.cop.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Capacity (kW)</Typography>
              <Typography>{results.capacity.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Power Input (kW)</Typography>
              <Typography>{results.powerInput.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Mass Flow (kg/s)</Typography>
              <Typography>{results.massFlow.toFixed(4)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }, [results]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Refrigeration System Calculator {type ? `- ${type.toUpperCase()} System` : ''}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Evaporator Temperature (°C)"
            name="evaporatorTemp"
            value={inputs.evaporatorTemp}
            onChange={handleInputChange}
            type="number"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Condenser Temperature (°C)"
            name="condenserTemp"
            value={inputs.condenserTemp}
            onChange={handleInputChange}
            type="number"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Cooling Capacity (kW)"
            name="capacity"
            value={inputs.capacity}
            onChange={handleInputChange}
            type="number"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Refrigerant Type"
            name="refrigerantType"
            value={inputs.refrigerantType}
            onChange={handleInputChange}
            margin="normal"
            SelectProps={{
              native: true
            }}
          >
            {/* If a type prop is passed, we lock the refrigerant type */}
            {type ? (
              <option value={inputs.refrigerantType}>{inputs.refrigerantType}</option>
            ) : (
              <>
                <option value="R134a">R134a</option>
                <option value="R410A">R410A</option>
                <option value="R407C">R407C</option>
                <option value="R32">R32</option>
              </>
            )}
          </TextField>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={calculateResults}
        sx={{ mt: 2 }}
      >
        Calculate
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {resultCards}
    </div>
  );
};

export default RefrigerationCalculator;