import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Badge,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Timeline,
  Thermostat,
  Speed,
  Power,
  Warning,
  Opacity
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { monitoringService } from '../../services/monitoringService';
import { SystemStatus, SensorData } from '../../types/monitoring';

const LiveMonitoring: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [isLiveUpdate, setIsLiveUpdate] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (isLiveUpdate) {
      const interval = setInterval(fetchSystemStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isLiveUpdate]);

  const fetchSystemStatus = async () => {
    try {
      const status = await monitoringService.getCurrentStatus();
      setSystemStatus(status);
      updateHistoricalData(status);
      checkAlerts(status);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const updateHistoricalData = (status: SystemStatus) => {
    setHistoricalData(prev => [...prev.slice(-50), {
      timestamp: new Date(),
      ...status.sensors
    }]);
  };

  const checkAlerts = (status: SystemStatus) => {
    const newAlerts = [];
    if (status.compressor.pressure > status.limits.maxPressure) {
      newAlerts.push('High pressure warning!');
    }
    if (status.evaporator.temperature < status.limits.minTemp) {
      newAlerts.push('Low temperature warning!');
    }
    setAlerts(newAlerts);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">System Live Monitoring</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isLiveUpdate}
              onChange={(e) => setIsLiveUpdate(e.target.checked)}
            />
          }
          label="Live Updates"
        />
      </Box>

      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Alert severity="warning" key={index} sx={{ mb: 1 }}>
              {alert}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Performance
            </Typography>
            {historicalData.length > 0 && (
              <Line
                data={{
                  labels: historicalData.map(d => 
                    new Date(d.timestamp).toLocaleTimeString()
                  ),
                  datasets: [
                    {
                      label: 'Compressor Pressure',
                      data: historicalData.map(d => d.compressorPressure),
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1
                    },
                    {
                      label: 'System Temperature',
                      data: historicalData.map(d => d.systemTemp),
                      borderColor: 'rgb(255, 99, 132)',
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compressor Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Speed color="primary" />
                    <Typography>
                      Pressure: {systemStatus?.compressor.pressure} bar
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Power color="secondary" />
                    <Typography>
                      Power: {systemStatus?.compressor.power} kW
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Evaporator Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Thermostat color="primary" />
                    <Typography>
                      Temperature: {systemStatus?.evaporator.temperature}°C
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Opacity color="secondary" />
                    <Typography>
                      Superheat: {systemStatus?.evaporator.superheat}°C
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveMonitoring;