// src/services/PerformanceService.ts

/**
 * @author erba82
 * @lastModified 2025-02-02 10:59:20
 */

import { apiService } from '../api/index';
import { ErrorHandler } from '../errorHandling/ErrorHandler';
import { MonitoringService } from '../monitoring/MonitoringService';
import {
  PerformanceData,
  PerformanceThresholds,
  Alert,
  PerformanceMetrics
} from '../../types/monitoring';

export class PerformanceService {
  private static instance: PerformanceService;
  private monitoringService: MonitoringService;
  private performanceHistory: PerformanceData[] = [];
  private readonly MAX_HISTORY_LENGTH = 1000;
  private thresholds: PerformanceThresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    responseTime: { warning: 2000, critical: 5000 },
    errorRate: { warning: 5, critical: 10 }
  };

  private constructor() {
    this.monitoringService = MonitoringService.getInstance();
    this.initializeService();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private async initializeService(): Promise<void> {
    try {
      await Promise.all([
        this.loadInitialThresholds(),
        this.loadInitialHistory()
      ]);
      
      this.initPerformanceMonitoring();
      this.initAlertHandlers();
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.initializeService');
    }
  }

  private async loadInitialThresholds(): Promise<void> {
    try {
      const response = await apiService.get<{ data: PerformanceThresholds }>('/performance/thresholds');
      this.thresholds = response.data.data;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.loadInitialThresholds');
      // Keep default thresholds if loading fails
    }
  }

  private async loadInitialHistory(): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours
      const history = await this.getPerformanceHistory(startDate, endDate);
      this.performanceHistory = history;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.loadInitialHistory');
    }
  }

  private initPerformanceMonitoring(): void {
    setInterval(async () => {
      try {
        await this.getCurrentPerformance();
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'PerformanceService.monitoringInterval');
      }
    }, 60000); // Monitor every minute
  }

  private initAlertHandlers(): void {
    this.monitoringService.registerAlertHandler((alert: Alert) => {
      if (alert.severity === 'high') {
        this.handleCriticalAlert(alert);
      }
    });
  }

  async getCurrentPerformance(): Promise<PerformanceData> {
    try {
      const response = await apiService.get<{ data: PerformanceData }>('/performance/current');
      const performanceData = this.processPerformanceData(response.data.data);
      
      this.updatePerformanceHistory(performanceData);
      await this.checkPerformanceIssues(performanceData);
      
      return performanceData;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.getCurrentPerformance');
      throw error;
    }
  }

  async getPerformanceHistory(
    startDate?: Date,
    endDate?: Date
  ): Promise<PerformanceData[]> {
    try {
      const params = {
        start: startDate?.toISOString(),
        end: endDate?.toISOString()
      };

      const response = await apiService.get<{ data: PerformanceData[] }>(
        '/performance/history',
        { params }
      );

      return response.data.data.map((data: PerformanceData) => this.processPerformanceData(data));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.getPerformanceHistory');
      return [];
    }
  }

  private processPerformanceData(data: PerformanceData): PerformanceData {
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      metrics: {
        ...data.metrics,
        cpu: Math.round(data.metrics.cpu * 100) / 100,
        memory: Math.round(data.metrics.memory * 100) / 100,
        responseTime: Math.round(data.metrics.responseTime),
        errorRate: Math.round(data.metrics.errorRate * 100) / 100
      }
    };
  }

  private updatePerformanceHistory(performanceData: PerformanceData): void {
    this.performanceHistory.push(performanceData);
    
    while (this.performanceHistory.length > this.MAX_HISTORY_LENGTH) {
      this.performanceHistory.shift();
    }
  }

  private async checkPerformanceIssues(data: PerformanceData): Promise<void> {
    const issues = this.detectPerformanceIssues(data);
    
    for (const issue of issues) {
      if (issue.severity === 'critical') {
        await this.handleCriticalAlert({
          id: `perf_${Date.now()}`,
          severity: 'high',
          message: issue.message,
          timestamp: new Date().toISOString(),
          componentId: 'performance',
          status: 'active',
          metadata: {
            metricType: issue.type,
            value: issue.value
          }
        });
      }
    }
  }

  private detectPerformanceIssues(data: PerformanceData): Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    value: number;
  }> {
    const issues: Array<{
      type: string;
      severity: 'warning' | 'critical';
      message: string;
      value: number;
    }> = [];
  
    // CPU Check
    if (data.metrics.cpu >= this.thresholds.cpu.critical) {
      issues.push({
        type: 'cpu',
        severity: 'critical' as const, // explicitly specify as literal type
        message: `Critical CPU usage: ${data.metrics.cpu}%`,
        value: data.metrics.cpu
      });
    } else if (data.metrics.cpu >= this.thresholds.cpu.warning) {
      issues.push({
        type: 'cpu',
        severity: 'warning' as const,
        message: `High CPU usage: ${data.metrics.cpu}%`,
        value: data.metrics.cpu
      });
    }
  
    // Memory Check
    if (data.metrics.memory >= this.thresholds.memory.critical) {
      issues.push({
        type: 'memory',
        severity: 'critical' as const,
        message: `Critical memory usage: ${data.metrics.memory}%`,
        value: data.metrics.memory
      });
    } else if (data.metrics.memory >= this.thresholds.memory.warning) {
      issues.push({
        type: 'memory',
        severity: 'warning' as const,
        message: `High memory usage: ${data.metrics.memory}%`,
        value: data.metrics.memory
      });
    }
  
    // Response Time Check
    if (data.metrics.responseTime >= this.thresholds.responseTime.critical) {
      issues.push({
        type: 'responseTime',
        severity: 'critical' as const,
        message: `Critical response time: ${data.metrics.responseTime}ms`,
        value: data.metrics.responseTime
      });
    } else if (data.metrics.responseTime >= this.thresholds.responseTime.warning) {
      issues.push({
        type: 'responseTime',
        severity: 'warning' as const,
        message: `High response time: ${data.metrics.responseTime}ms`,
        value: data.metrics.responseTime
      });
    }
  
    // Error Rate Check
    if (data.metrics.errorRate >= this.thresholds.errorRate.critical) {
      issues.push({
        type: 'errorRate',
        severity: 'critical' as const,
        message: `Critical error rate: ${data.metrics.errorRate}%`,
        value: data.metrics.errorRate
      });
    } else if (data.metrics.errorRate >= this.thresholds.errorRate.warning) {
      issues.push({
        type: 'errorRate',
        severity: 'warning' as const,
        message: `High error rate: ${data.metrics.errorRate}%`,
        value: data.metrics.errorRate
      });
    }
  
    return issues;
  }

  private async handleCriticalAlert(alert: Alert): Promise<void> {
    try {
      await apiService.post('/performance/alerts/critical', { alert });
      // Additional critical alert handling logic can be added here
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.handleCriticalAlert');
    }
  }
}