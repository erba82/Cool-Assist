import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { SystemAnalysis } from '../../utils/systemAnalysis';
import { PerformanceOptimizer } from '../../services/optimization/PerformanceOptimizer';
import { MonitoringService } from '../../services/monitoring/MonitoringService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SystemMetrics {
  efficiency: number;
  performance: number;
  reliability: number;
  maintenance: number;
}

interface SystemAlert {
  id: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

interface OptimizationSuggestion {
  message: string;
}

export const SystemAnalyzer: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  const fetchSystemData = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Initialize services
      const analyzer = new SystemAnalysis();
      const optimizer = PerformanceOptimizer.getInstance();
      const monitoring = MonitoringService.getInstance();

      // Fetch current system metrics
      const currentMetrics = await analyzer.getCurrentMetrics();
      setMetrics(currentMetrics);

      // Fetch active alerts
      const systemAlerts = await monitoring.getActiveAlerts();
      setAlerts(systemAlerts.map(alert => ({
        id: Number(alert.id),
        severity: alert.severity as 'low' | 'medium' | 'high',
        message: alert.message,
        timestamp: alert.timestamp,
        status: alert.status as 'active' | 'resolved'
      })));
      // Get performance history
      const history = await monitoring.getPerformanceHistory();
      setPerformanceData(history);

      // Generate optimization suggestions
      const suggestions = await optimizer.generateSuggestions(currentMetrics);
      setOptimizationSuggestions(suggestions.map(suggestion => suggestion.message));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze system');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
    // Set up real-time monitoring
    const monitoringInterval = setInterval(fetchSystemData, 300000); // Update every 5 minutes
    return () => clearInterval(monitoringInterval);
  }, [fetchSystemData]);

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Analysis Dashboard
      </Typography>

      {isAnalyzing && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {metrics && (
        <Grid container spacing={3}>
          {/* System Metrics Cards */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Metrics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2">System Efficiency</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.efficiency}
                      color={getMetricColor(metrics.efficiency)}
                    />
                    <Typography variant="caption">{metrics.efficiency}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">Performance Index</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.performance}
                      color={getMetricColor(metrics.performance)}
                    />
                    <Typography variant="caption">{metrics.performance}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">Reliability Score</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.reliability}
                      color={getMetricColor(metrics.reliability)}
                    />
                    <Typography variant="caption">{metrics.reliability}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">Maintenance Health</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.maintenance}
                      color={getMetricColor(metrics.maintenance)}
                    />
                    <Typography variant="caption">{metrics.maintenance}%</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="efficiency" stroke="#8884d8" />
                      <Line type="monotone" dataKey="performance" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Alerts */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Alerts
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Severity</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Chip 
                            label={alert.severity.toUpperCase()} 
                            color={getAlertColor(alert.severity) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>{alert.timestamp}</TableCell>
                        <TableCell>
                          <Chip 
                            label={alert.status}
                            color={alert.status === 'active' ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Optimization Suggestions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Optimization Suggestions
                </Typography>
                <Timeline>
                  {optimizationSuggestions.map((suggestion, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < optimizationSuggestions.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography>{suggestion}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={fetchSystemData}
          disabled={isAnalyzing}
        >
          Refresh Analysis
        </Button>
      </Box>
    </Box>
  );
};

export default SystemAnalyzer;