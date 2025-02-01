import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Container,
  Paper
} from '@mui/material';
import HVACCalculator from '../components/Calculator/HVACCalculator';
import RefrigerationCalculator from '../components/Calculator/RefrigerationCalculator';

const CalculatorPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        HVAC & Refrigeration Calculator
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Air Conditioning" />
          <Tab label="Ammonia Systems" />
          <Tab label="Freon Systems" />
          <Tab label="CO2 Systems" />
          <Tab label="Load Calculation" />
          <Tab label="Pipe Sizing" />
          <Tab label="System Analysis" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <HVACCalculator />}
          {tabValue === 1 && <RefrigerationCalculator type="ammonia" />}
          {tabValue === 2 && <RefrigerationCalculator type="freon" />}
          {tabValue === 3 && <RefrigerationCalculator type="co2" />}
          {/* ... other tabs */}
        </Box>
      </Paper>
    </Container>
  );
};

export default CalculatorPage;