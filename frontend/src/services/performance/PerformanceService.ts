import { ApiService } from '../api';
import { ErrorHandler } from '../errorHandling/ErrorHandler';
import { MonitoringService } from '../monitoring/MonitoringService';

interface PerformanceData {
  timestamp: Date;
  overallPerformance: number;
  metrics: {
    cpu: number;
    memory: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  components: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'critical';
      performance: number;
      loadFactor: number;
      efficiency: number;
    };
  };
}

interface PerformanceThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  responseTime: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
}

export class PerformanceService {
  private static instance: PerformanceService;
  private monitoringService: MonitoringService;
  private performanceHistory: PerformanceData[] = [];
  private readonly MAX_HISTORY_LENGTH = 1000;
  private thresholds: PerformanceThresholds;

  private constructor() {
    this.monitoringService = MonitoringService.getInstance();
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      responseTime: { warning: 2000, critical: 5000 },
      errorRate: { warning: 5, critical: 10 }
    };
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
      // Load custom thresholds from configuration
      await this.loadThresholds();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Register alert handlers
      this.registerAlertHandlers();
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.initializeService');
    }
  }

  async getCurrentPerformance(): Promise<PerformanceData> {
    try {
      const response = await ApiService.get('/performance/current');
      const performanceData = this.processPerformanceData(response.data);
      
      this.updatePerformanceHistory(performanceData);
      this.analyzePerformance(performanceData);
      
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

      const response = await ApiService.get('/performance/history', { params });
      return response.data.map((data: any) => this.processPerformanceData(data));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.getPerformanceHistory');
      return [];
    }
  }

  async analyzePerformanceTrends(days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await this.getPerformanceHistory(startDate, endDate);
      
      return {
        averagePerformance: this.calculateAveragePerformance(history),
        trends: this.identifyTrends(history),
        bottlenecks: this.identifyBottlenecks(history),
        recommendations: await this.generateRecommendations(history)
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.analyzePerformanceTrends');
      throw error;
    }
  }

  private processPerformanceData(data: any): PerformanceData {
    return {
      ...data,
      timestamp: new Date(data.timestamp)
    };
  }

  private updatePerformanceHistory(performanceData: PerformanceData): void {
    this.performanceHistory.push(performanceData);
    if (this.performanceHistory.length > this.MAX_HISTORY_LENGTH) {
      this.performanceHistory.shift();
    }
  }

  private analyzePerformance(performanceData: PerformanceData): void {
    // Check for performance issues
    const issues = this.checkPerformanceIssues(performanceData);
    
    // Generate alerts for critical issues
    issues.forEach(issue => {
      if (issue.severity === 'critical') {
        this.monitoringService.registerAlertHandler((alert) => {
          console.log('Performance Alert:', alert);
        });
      }
    });
  }

  private checkPerformanceIssues(data: PerformanceData): Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
  }> {
    const issues = [];

    // Check CPU usage
    if (data.metrics.cpu >= this.thresholds.cpu.critical) {
      issues.push({
        type: 'cpu',
        severity: 'critical',
        message: `High CPU usage: ${data.metrics.cpu}%`
      });
    } else if (data.metrics.cpu >= this.thresholds.cpu.warning) {
      issues.push({
        type: 'cpu',
        severity: 'warning',
        message: `Elevated CPU usage: ${data.metrics.cpu}%`
      });
    }

    // Check Memory usage
    if (data.metrics.memory >= this.thresholds.memory.critical) {
      issues.push({
        type: 'memory',
        severity: 'critical',
        message: `High memory usage: ${data.metrics.memory}%`
      });
    } else if (data.metrics.memory >= this.thresholds.memory.warning) {
      issues.push({
        type: 'memory',
        severity: 'warning',
        message: `Elevated memory usage: ${data.metrics.memory}%`
      });
    }

    // Check Response Time
    if (data.metrics.responseTime >= this.thresholds.responseTime.critical) {
      issues.push({
        type: 'responseTime',
        severity: 'critical',
        message: `High response time: ${data.metrics.responseTime}ms`
      });
    }

    return issues;
  }

  private async loadThresholds(): Promise<void> {
    try {
      const response = await ApiService.get('/performance/thresholds');
      this.thresholds = response.data;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.loadThresholds');
    }
  }

  private calculateAveragePerformance(history: PerformanceData[]): number {
    if (history.length === 0) return 0;
    
    const sum = history.reduce((acc, data) => acc + data.overallPerformance, 0);
    return sum / history.length;
  }

  private identifyTrends(history: PerformanceData[]): any {
    const trends = {
      performance: this.calculateTrend(history.map(h => h.overallPerformance)),
      cpu: this.calculateTrend(history.map(h => h.metrics.cpu)),
      memory: this.calculateTrend(history.map(h => h.metrics.memory)),
      responseTime: this.calculateTrend(history.map(h => h.metrics.responseTime))
    };

    return trends;
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const changes = values.slice(1).map((value, index) => value - values[index]);
    const averageChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    if (averageChange > 0.05) return 'increasing';
    if (averageChange < -0.05) return 'decreasing';
    return 'stable';
  }

  private identifyBottlenecks(history: PerformanceData[]): any {
    const bottlenecks = [];
    const latestData = history[history.length - 1];

    // Check each component for potential bottlenecks
    Object.entries(latestData.components).forEach(([component, data]) => {
      if (data.loadFactor > 0.8) {
        bottlenecks.push({
          component,
          loadFactor: data.loadFactor,
          efficiency: data.efficiency
        });
      }
    });

    return bottlenecks;
  }

  private async generateRecommendations(history: PerformanceData[]): Promise<string[]> {
    const recommendations = [];
    const trends = this.identifyTrends(history);
    const bottlenecks = this.identifyBottlenecks(history);

    // Add recommendations based on trends
    if (trends.performance === 'decreasing') {
      recommendations.push('System performance is degrading. Consider scaling resources.');
    }

    // Add recommendations based on bottlenecks
    bottlenecks.forEach(bottleneck => {
      recommendations.push(
        `Component ${bottleneck.component} is experiencing high load (${bottleneck.loadFactor * 100}%). Consider optimization.`
      );
    });

    return recommendations;
  }

  private startPerformanceMonitoring(): void {
    setInterval(async () => {
      try {
        await this.getCurrentPerformance();
      } catch (error) {
        ErrorHandler.handleError(error as Error, 'PerformanceService.startPerformanceMonitoring');
      }
    }, 60000); // Monitor every minute
  }

  private registerAlertHandlers(): void {
    this.monitoringService.registerAlertHandler((alert) => {
      if (alert.severity === 'high') {
        this.handleCriticalAlert(alert);
      }
    });
  }

  private async handleCriticalAlert(alert: any): Promise<void> {
    try {
      await ApiService.post('/performance/alerts/critical', { alert });
      // Implement additional critical alert handling logic
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'PerformanceService.handleCriticalAlert');
    }
  }
}