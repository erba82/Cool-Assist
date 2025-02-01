import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { calculateHVACLoad } from '../../utils/calculations';

const steps = ['Room Details', 'Heat Sources', 'System Requirements'];

const HVACCalculator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    roomLength: '',
    roomWidth: '',
    roomHeight: '',
    occupants: '',
    equipment: '',
    windows: '',
    insulation: 'standard',
    outdoorTemp: '',
    desiredTemp: '',
  });

  const handleCalculate = () => {
    const results = calculateHVACLoad(formData);
    // Handle results...
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {activeStep === 0 && (
          <>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Room Length"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter room length in meters">
                        <IconButton size="small">
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                value={formData.roomLength}
                onChange={(e) => setFormData({...formData, roomLength: e.target.value})}
              />
            </Grid>
            {/* Similar fields for width and height */}
          </>
        )}
        {/* Additional steps... */}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
        >
          Back
        </Button>
        <Button 
          variant="contained" 
          onClick={activeStep === steps.length - 1 ? handleCalculate : () => setActiveStep(prev => prev + 1)}
        >
          {activeStep === steps.length - 1 ? 'Calculate' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default HVACCalculator;