import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert
} from '@mui/material';
import { generateSystemDesign, DesignRequirements, SystemDesign } from '../../utils/systemDesigner';
import DesignViewer from './DesignViewer';

const steps = [
  'Project Requirements',
  'Space Details',
  'System Specifications',
  'Design Review'
];

const AutomaticSystemDesigner: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [requirements, setRequirements] = useState<DesignRequirements>({
    projectType: '',
    coolingCapacity: 0,
    location: '',
    spaceType: '',
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    temperature: {
      ambient: 0,
      required: 0
    },
    humidity: {
      ambient: 0,
      required: 0
    },
    operatingHours: 0,
    budget: 0
  });

  const [designResult, setDesignResult] = useState<SystemDesign | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      try {
        const design = await generateSystemDesign(requirements);
        setDesignResult(design);
        setError(null);
      } catch (err) {
        setError('Error generating system design');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ProjectRequirements requirements={requirements} setRequirements={setRequirements} />;
      case 1:
        return <SpaceDetails requirements={requirements} setRequirements={setRequirements} />;
      case 2:
        return <SystemSpecs requirements={requirements} setRequirements={setRequirements} />;
      case 3:
        return <DesignViewer design={designResult} />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Automatic System Designer
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2, mb: 2 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={activeStep === steps.length - 1}
        >
          {activeStep === steps.length - 2 ? 'Generate Design' : 'Next'}
        </Button>
      </Box>
    </Paper>
  );
};

const ProjectRequirements: React.FC<{
  requirements: DesignRequirements;
  setRequirements: (req: DesignRequirements) => void;
}> = ({ requirements, setRequirements }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Project Type</InputLabel>
        <Select
          value={requirements.projectType}
          onChange={(e) => setRequirements({
            ...requirements,
            projectType: e.target.value
          })}
        >
          <MenuItem value="industrial">Industrial Refrigeration</MenuItem>
          <MenuItem value="commercial">Commercial Refrigeration</MenuItem>
          <MenuItem value="process">Process Cooling</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Required Cooling Capacity (kW)"
        type="number"
        value={requirements.coolingCapacity || ''}
        onChange={(e) => setRequirements({
          ...requirements,
          coolingCapacity: Number(e.target.value)
        })}
      />
    </Grid>
    {/* Add more fields */}
  </Grid>
);

// Similar components for SpaceDetails and SystemSpecs...

export default AutomaticSystemDesigner;