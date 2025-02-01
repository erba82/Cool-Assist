import { ApiService } from '../api';
import { ErrorHandler } from '../errorHandling/ErrorHandler';

interface SystemStatus {
  componentId: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastMaintenance: Date;
  efficiency: number;
  temperature: number;
  pressure: number;
  powerConsumption: number;
  runtime: number;
}

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  componentId: string;
  status: 'active' | 'resolved';
  metadata: Record<string, any>;
}

interface PerformanceMetrics {
  timestamp: Date;
  efficiency: number;
  powerConsumption: number;
  temperature: number;
  pressure: number;
  flowRate: number;
  humidity: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private wsConnection: WebSocket | null = null;
  private alertHandlers: ((alert: Alert) => void)[] = [];
  private readonly WS_RECONNECT_DELAY = 5000;
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly BUFFER_SIZE = 1000;

  private constructor() {
    this.initializeWebSocket();
    this.startPerformanceLogging();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeWebSocket(): void {
    try {
      const wsUrl = `${process.env.REACT_APP_WS_URL}/monitoring`;
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
          this.notifyAlertHandlers(data.alert);
        }
      };

      this.wsConnection.onclose = () => {
        setTimeout(() => this.initializeWebSocket(), this.WS_RECONNECT_DELAY);
      };

    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.initializeWebSocket');
    }
  }

  async getComponentsStatus(): Promise<SystemStatus[]> {
    try {
      const response = await ApiService.get('/monitoring/components/status');
      return response.data.map((status: SystemStatus) => ({
        ...status,
        lastMaintenance: new Date(status.lastMaintenance)
      }));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getComponentsStatus');
      return [];
    }
  }

  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const response = await ApiService.get('/monitoring/alerts/active');
      return response.data.map((alert: Alert) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getActiveAlerts');
      return [];
    }
  }

  async getPerformanceHistory(
    startDate?: Date,
    endDate?: Date,
    metrics: string[] = ['efficiency', 'powerConsumption']
  ): Promise<PerformanceMetrics[]> {
    try {
      const params = {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
        metrics: metrics.join(',')
      };

      const response = await ApiService.get('/monitoring/performance/history', { params });
      return response.data.map((metric: PerformanceMetrics) => ({
        ...metric,
        timestamp: new Date(metric.timestamp)
      }));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getPerformanceHistory');
      return [];
    }
  }

  async getSystemUptime(): Promise<{ uptime: number; totalTime: number }> {
    try {
      const response = await ApiService.get('/monitoring/system/uptime');
      return response.data;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getSystemUptime');
      return { uptime: 0, totalTime: 0 };
    }
  }

  async getErrorRate(): Promise<{ errors: number; totalOperations: number }> {
    try {
      const response = await ApiService.get('/monitoring/system/error-rate');
      return response.data;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getErrorRate');
      return { errors: 0, totalOperations: 0 };
    }
  }

  registerAlertHandler(handler: (alert: Alert) => void): void {
    this.alertHandlers.push(handler);
  }

  unregisterAlertHandler(handler: (alert: Alert) => void): void {
    this.alertHandlers = this.alertHandlers.filter(h => h !== handler);
  }

  private notifyAlertHandlers(alert: Alert): void {
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'MonitoringService.notifyAlertHandlers');
      }
    });
  }

  private startPerformanceLogging(): void {
    setInterval(() => {
      this.logCurrentPerformance();
    }, 60000); // Log every minute
  }

  private async logCurrentPerformance(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics();
      this.metricsBuffer.push(metrics);

      if (this.metricsBuffer.length > this.BUFFER_SIZE) {
        await this.flushMetricsBuffer();
      }
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.logCurrentPerformance');
    }
  }

  private async getCurrentMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await ApiService.get('/monitoring/metrics/current');
      return {
        ...response.data,
        timestamp: new Date()
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getCurrentMetrics');
      throw error;
    }
  }

  private async flushMetricsBuffer(): Promise<void> {
    try {
      if (this.metricsBuffer.length === 0) return;

      await ApiService.post('/monitoring/metrics/bulk', {
        metrics: this.metricsBuffer
      });

      this.metricsBuffer = [];
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.flushMetricsBuffer');
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.flushMetricsBuffer();
      this.wsConnection?.close();
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.cleanup');
    }
  }
}