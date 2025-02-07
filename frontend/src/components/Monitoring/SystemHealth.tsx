import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { MonitoringService } from '../../services/monitoring/MonitoringService';

interface ComponentHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastMaintenance: Date;
  efficiency: number;
  temperature: number;
  pressure: number;
  runtime: number;
}

interface HealthHistory {
  timestamp: Date;
  status: string;
  message: string;
}

export const SystemHealth: React.FC = () => {
  const [components, setComponents] = useState<ComponentHealth[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentHealth | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const monitoringService = MonitoringService.getInstance();

  const fetchSystemHealth = useCallback(async () => {
    try {
      setLoading(true);
      const componentsStatus = await monitoringService.getComponentsStatus();
      const mappedComponents = componentsStatus.map((component: any) => ({
        id: component.id,
        name: component.name,
        status: component.status || (component.efficiency < 60 ? 'critical' : component.efficiency < 80 ? 'warning' : 'healthy'),
        lastMaintenance: component.lastMaintenance,
        efficiency: component.efficiency,
        temperature: component.temperature || 0,
        pressure: component.pressure || 0,
        runtime: component.runtime || 0,
      }));
      setComponents(mappedComponents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  const handleComponentClick = async (component: ComponentHealth) => {
    setSelectedComponent(component);
    try {
      const history = await (monitoringService as any).getComponentHistory(component.id);
      setHealthHistory(history);
      setDialogOpen(true);
    } catch (err) {
      setError('Failed to load component history');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'critical':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const formatRuntime = (runtime: number) => {
    const hours = Math.floor(runtime / 3600);
    const minutes = Math.floor((runtime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">System Health Monitor</Typography>
        <IconButton onClick={fetchSystemHealth} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {components.map((component) => (
          <Grid item xs={12} md={6} lg={4} key={component.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => handleComponentClick(component)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{component.name}</Typography>
                  {getStatusIcon(component.status)}
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={component.efficiency}
                    color={component.efficiency < 60 ? "error" : 
                           component.efficiency < 80 ? "warning" : "success"}
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="caption">
                    {component.efficiency}%
                  </Typography>
                </Box>

                <Grid container spacing={1} mt={1}>
                  <Grid item xs={6}>
                    <Tooltip title="Operating Temperature">
                      <Typography variant="body2">
                        Temp: {component.temperature}°C
                      </Typography>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Operating Pressure">
                      <Typography variant="body2">
                        Pressure: {component.pressure} kPa
                      </Typography>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Runtime: {formatRuntime(component.runtime)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedComponent && (
          <>
            <DialogTitle>
              {selectedComponent.name} - Detailed Status
            </DialogTitle>
            <DialogContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {healthHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {record.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getStatusIcon(record.status)}
                          <Typography ml={1}>
                            {record.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{record.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SystemHealth;