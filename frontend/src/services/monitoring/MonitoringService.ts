/**
 * @author erba82
 * @lastModified 2025-02-02 10:51:30
 */

import { apiService } from '../api/index';
import { ErrorHandler } from '../errorHandling/ErrorHandler';
import {
  SystemStatus,
  SystemStatusResponse,
  Alert,
  PerformanceMetrics,
  UptimeData,
  ErrorRateData,
  Component
} from '../../types/monitoring';

export class MonitoringService {
  private static instance: MonitoringService;
  private wsConnection: WebSocket | null = null;
  private alertHandlers: ((alert: Alert) => void)[] = [];
  private readonly WS_RECONNECT_DELAY = 5000;
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly BUFFER_SIZE = 1000;
  private isConnecting: boolean = false;

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

  private async initializeWebSocket(): Promise<void> {
    if (this.isConnecting) return;

    try {
      this.isConnecting = true;
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}/monitoring`;
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('Monitoring WebSocket connected');
        this.isConnecting = false;
      };

      this.wsConnection.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'alert') {
            this.notifyAlertHandlers(data.alert as Alert);
          }
        } catch (error) {
          ErrorHandler.handleError(error as Error, 'MonitoringService.wsOnMessage');
        }
      };

      this.wsConnection.onclose = () => {
        this.isConnecting = false;
        console.log('Monitoring WebSocket disconnected, attempting to reconnect...');
        setTimeout(() => this.initializeWebSocket(), this.WS_RECONNECT_DELAY);
      };

      this.wsConnection.onerror = (event: Event) => {
        this.isConnecting = false;
        const error = new Error('WebSocket connection error');
        error.name = 'WebSocketError';
        // @ts-ignore
        error.cause = event;
        ErrorHandler.handleError(error, 'MonitoringService.wsError');
      };

    } catch (error) {
      this.isConnecting = false;
      ErrorHandler.handleError(error as Error, 'MonitoringService.initializeWebSocket');
    }
  }

  async getComponentsStatus(): Promise<SystemStatus[]> {
    try {
      const response = await apiService.get<{ data: SystemStatusResponse[] }>('/monitoring/components/status');
      return response.data.data.map((status: SystemStatusResponse) => this.mapToSystemStatus(status));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getComponentsStatus');
      return [];
    }
  }

  private mapToSystemStatus(status: SystemStatusResponse): SystemStatus {
    return {
      ...status,
      timestamp: status.timestamp,
      lastMaintenance: status.lastMaintenance,
      components: status.components.map(component => this.mapComponent(component))
    };
  }

  private mapComponent(component: Component): Component {
    return {
      ...component,
      lastMaintenance: component.lastMaintenance
    };
  }

  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const response = await apiService.get<{ data: Alert[] }>('/monitoring/alerts/active');
      return response.data.data.map(alert => ({
        ...alert,
        timestamp: alert.timestamp // نیازی به تبدیل به تاریخ نیست
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

      const response = await apiService.get<{ data: PerformanceMetrics[] }>(
        '/monitoring/performance/history',
        { params }
      );

      return response.data.data.map(metric => ({
        ...metric,
        timestamp: new Date(metric.timestamp)
      }));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getPerformanceHistory');
      return [];
    }
  }

  async getSystemUptime(): Promise<UptimeData> {
    try {
      const response = await apiService.get<{ data: UptimeData }>('/monitoring/system/uptime');
      return {
        ...response.data.data,
        timestamp: new Date(),
        lastDowntime: response.data.data.lastDowntime // نیازی به تبدیل به تاریخ نیست
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getSystemUptime');
      return {
        timestamp: new Date(),
        uptime: 0,
        totalTime: 0
      };
    }
  }

  async getErrorRate(): Promise<ErrorRateData> {
    try {
      const response = await apiService.get<{ data: ErrorRateData }>('/monitoring/system/error-rate');
      return {
        ...response.data.data,
        timestamp: new Date()
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getErrorRate');
      return {
        timestamp: new Date(),
        total: 0,
        critical: 0,
        warning: 0,
        errorRate: 0,
        errors: 0,
        totalOperations: 0
      };
    }
  }

  registerAlertHandler(handler: (alert: Alert) => void): void {
    if (!this.alertHandlers.includes(handler)) {
      this.alertHandlers.push(handler);
    }
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
    setInterval(async () => {
      try {
        await this.logCurrentPerformance();
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'MonitoringService.startPerformanceLogging');
      }
    }, 60000); // ثبت هر دقیقه
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
      const response = await apiService.get<{ data: PerformanceMetrics }>('/monitoring/metrics/current');
      return {
        ...response.data.data,
        timestamp: new Date()
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.getCurrentMetrics');
      throw error;
    }
  }

  private async flushMetricsBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      await apiService.post('/monitoring/metrics/bulk', {
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
      this.alertHandlers = [];
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'MonitoringService.cleanup');
    }
  }
}