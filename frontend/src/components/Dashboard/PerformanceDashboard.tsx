/**
 * @author erba82
 * @lastModified 2025-02-07 12:13:21
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonitoringService } from '../../services/monitoring/MonitoringService';
import { PerformanceOptimizer } from '../../services/optimization/PerformanceOptimizer';

// Interfaces
export interface PerformanceData {
  timestamp: Date;
  metrics: {
    cpu: number;
    memory: number;
  };
}

export class PerformanceService {
  async getCurrentPerformance(): Promise<{metrics: { cpu: number; memory: number; responseTime: number; errorRate: number } }> {
    // Replace this dummy data with your actual implementation.
    return {
      metrics: {
        cpu: 50,
        memory: 60,
        responseTime: 1500,
        errorRate: 0
      }
    };
  }

  async getPerformanceHistory(): Promise<PerformanceData[]> {
    // Implement your history fetching logic here
    return [];
  }
}

interface MonitoringAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
}

interface ChartDataPoint {
  timestamp: number;
  metrics: {
    cpu: number;
    memory: number;
  };
}

interface DashboardSystemMetrics {
  efficiency: number;
  performance: number;
  reliability: number;
  maintenance: number;
}

interface OptimizationSuggestion {
  description: string;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<ChartDataPoint[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const performanceService = useMemo(() => new PerformanceService(), []);
  const monitoringService = useMemo(() => MonitoringService.getInstance(), []);
  const optimizer = useMemo(() => PerformanceOptimizer.getInstance(), []);

  const transformPerformanceData = (data: PerformanceData[]): ChartDataPoint[] => {
    return data.map(item => ({
      timestamp: item.timestamp.getTime(),
      metrics: {
        cpu: item.metrics.cpu,
        memory: item.metrics.memory
      }
    }));
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        const currentPerformance = await performanceService.getCurrentPerformance();
        setMetrics(currentPerformance.metrics);

        const history = await performanceService.getPerformanceHistory();
        setPerformanceHistory(transformPerformanceData(history));

        const activeAlerts = await monitoringService.getActiveAlerts();
        setAlerts(activeAlerts);

        const systemMetrics: DashboardSystemMetrics = {
          efficiency: currentPerformance.metrics.cpu,
          performance: currentPerformance.metrics.responseTime,
          reliability: 100, // use fixed value or remove if not needed
          maintenance: currentPerformance.metrics.errorRate
        };

        const optimizationSuggestions: OptimizationSuggestion[] = 
          await optimizer.generateSuggestions(systemMetrics);
        setSuggestions(optimizationSuggestions.map(suggestion => suggestion.description));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    const updateInterval = setInterval(initializeDashboard, 60000);

    const alertHandler = (newAlert: MonitoringAlert) => {
      setAlerts(prev => [...prev, newAlert]);
    };

    monitoringService.registerAlertHandler(alertHandler);

    return () => {
      clearInterval(updateInterval);
      monitoringService.cleanup();
    };
  }, [performanceService, monitoringService, optimizer]);

  const getSeverityColor = (value: number, thresholds: { warning: number; critical: number }): 'success' | 'warning' | 'error' => {
    if (value >= thresholds.critical) return 'error';
    if (value >= thresholds.warning) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Performance Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Performance Metrics Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Metrics
              </Typography>
              <Grid container spacing={2}>
                {metrics && Object.entries(metrics).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </Typography>
                      <Chip
                        label={`${value}${key === 'responseTime' ? 'ms' : '%'}`}
                        color={getSeverityColor(value, {
                          warning: key === 'responseTime' ? 2000 : 70,
                          critical: key === 'responseTime' ? 5000 : 90
                        })}
                        size="small"
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance History Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="metrics.cpu" stroke="#8884d8" name="CPU" />
                    <Line type="monotone" dataKey="metrics.memory" stroke="#82ca9d" name="Memory" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Alerts
              </Typography>
              <Box>
                {alerts.length === 0 ? (
                  <Typography color="text.secondary">No active alerts</Typography>
                ) : (
                  alerts.map((alert) => (
                    <Alert 
                      key={alert.id}
                      severity={alert.severity === 'high' ? 'error' : 
                               alert.severity === 'medium' ? 'warning' : 'info'}
                      sx={{ mb: 1 }}
                    >
                      {alert.message}
                    </Alert>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Optimization Suggestions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optimization Suggestions
              </Typography>
              <Box>
                {suggestions.length === 0 ? (
                  <Typography color="text.secondary">
                    No optimization suggestions available
                  </Typography>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <Alert 
                      key={index}
                      severity="info"
                      sx={{ mb: 1 }}
                      action={
                        <Button color="inherit" size="small">
                          Apply
                        </Button>
                      }
                    >
                      {suggestion}
                    </Alert>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceDashboard;