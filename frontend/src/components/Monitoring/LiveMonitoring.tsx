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
import { MonitoringService } from '../../services/monitoring/MonitoringService';
import { SystemStatus } from '../../types/monitoring';

interface SensorData {
  timestamp: Date;
  compressorPressure?: number;
  systemTemp?: number;
}

const monitoringService = MonitoringService.getInstance();

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
      const status = await monitoringService.getComponentsStatus();
      setSystemStatus(status[0]);
      updateHistoricalData(status[0]);
      checkAlerts(status[0]);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const updateHistoricalData = (status: SystemStatus) => {
    setHistoricalData(prev => [
      ...prev.slice(-50),
      {
        timestamp: new Date(),
        ...(status as any).sensors
      }
    ]);
  };

  const checkAlerts = (status: SystemStatus) => {
    const liveStatus = status as unknown as { 
      sensors: { 
        compressorPressure: number; 
        temperature: number; 
        superheat: number; 
        power: number; 
      }; 
      limits: { 
        maxPressure: number; 
        minTemp: number; 
      }; 
    };
    const newAlerts = [];
    if (liveStatus.sensors.compressorPressure > liveStatus.limits.maxPressure) {
      newAlerts.push('High pressure warning!');
    }
    if (liveStatus.sensors.temperature < liveStatus.limits.minTemp) {
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
                      data: historicalData.map(d => d.compressorPressure ?? null),
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1
                    },
                    {
                      label: 'System Temperature',
                      data: historicalData.map(d => d.systemTemp ?? null),
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
                      Pressure: {(systemStatus as any)?.sensors?.compressorPressure} bar
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Power color="secondary" />
                    <Typography>
                      Power: {(systemStatus as any)?.sensors?.power} kW
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
                      Temperature: {(systemStatus as any)?.sensors?.temperature}°C
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Opacity color="secondary" />
                    <Typography>
                      Superheat: {(systemStatus as any)?.sensors?.superheat}°C
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