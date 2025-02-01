import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { calculateRefrigeration } from '../../utils/calculations';

interface RefrigerationCalculatorProps {
  type: 'ammonia' | 'freon' | 'co2';
}

const RefrigerationCalculator: React.FC<RefrigerationCalculatorProps> = ({ type }) => {
  const [formData, setFormData] = useState({
    capacity: '',
    evaporatingTemp: '',
    condensingTemp: '',
    subcooling: '',
    superheating: '',
    refrigerantType: '',
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {type.toUpperCase()} Refrigeration System Calculator
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Refrigerant Type</InputLabel>
              <Select
                value={formData.refrigerantType}
                onChange={(e) => setFormData({...formData, refrigerantType: e.target.value})}
              >
                {type === 'ammonia' && <MenuItem value="R717">R717 (Ammonia)</MenuItem>}
                {type === 'freon' && (
                  <>
                    <MenuItem value="R134a">R134a</MenuItem>
                    <MenuItem value="R404A">R404A</MenuItem>
                    <MenuItem value="R410A">R410A</MenuItem>
                  </>
                )}
                {type === 'co2' && <MenuItem value="R744">R744 (CO2)</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cooling Capacity"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">kW</InputAdornment>,
              }}
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            />
          </Grid>
          {/* Additional fields... */}
        </Grid>
        
        <Button 
          variant="contained" 
          color="primary"
          fullWidth 
          sx={{ mt: 3 }}
          onClick={handleCalculate}
        >
          Calculate System Parameters
        </Button>
      </CardContent>
    </Card>
  );
};

export default RefrigerationCalculator;