/**
 * @author erba82
 * @lastModified 2025-02-02 11:38:16
 */

import { MonitoringService } from '../services/monitoring/MonitoringService';
import { PerformanceService } from '../services/performance/PerformanceService';
import { ErrorHandler } from '../services/errorHandling/ErrorHandler';
import type {
  Component,
  UptimeData,
  ErrorRateData,
  PerformanceData,
  SystemStatus
} from '../types/monitoring';

type ComponentStatus = 'healthy' | 'warning' | 'critical';

interface SystemMetrics {
  efficiency: number;
  performance: number;
  reliability: number;
  maintenance: number;
}

interface ComponentHealth {
  id: string;
  name: string;
  status: ComponentStatus;
  lastMaintenance?: string;
  efficiency: number;
}

export class SystemAnalysis {
  private static readonly MAINTENANCE_INTERVAL_DAYS = 90;
  private static readonly CRITICAL_EFFICIENCY_THRESHOLD = 60;
  private static readonly WARNING_EFFICIENCY_THRESHOLD = 80;

  private readonly monitoringService: MonitoringService;
  private readonly performanceService: PerformanceService;

  constructor() {
    this.monitoringService = MonitoringService.getInstance();
    this.performanceService = PerformanceService.getInstance();
  }

  public async getCurrentMetrics(): Promise<SystemMetrics> {
    try {
      const [efficiency, performance, reliability, maintenance] = await Promise.all([
        this.calculateEfficiency(),
        this.calculatePerformance(),
        this.calculateReliability(),
        this.calculateMaintenanceHealth()
      ]);

      return {
        efficiency: this.normalizeMetric(efficiency),
        performance: this.normalizeMetric(performance),
        reliability: this.normalizeMetric(reliability),
        maintenance: this.normalizeMetric(maintenance)
      };
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'SystemAnalysis.getCurrentMetrics'
      );
      throw error;
    }
  }

  public async getComponentHealth(): Promise<ComponentHealth[]> {
    try {
      const status = await this.monitoringService.getComponentsStatus();
      return status[0]?.components.map(component => {
        // Casting component to any to access 'efficiency', which might not be defined in the type.
        const eff = (component as any).efficiency || 0;
        return {
          id: component.id,
          name: component.name,
          status: this.determineComponentStatus(eff),
          lastMaintenance: component.lastMaintenance,
          efficiency: eff
        };
      }) || [];
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'SystemAnalysis.getComponentHealth'
      );
      return [];
    }
  }

  private async calculateEfficiency(): Promise<number> {
    try {
      const status = await this.monitoringService.getComponentsStatus();
      const components: Component[] = status[0]?.components || [];
      if (!components.length) return 0;

      // Casting to any to access the 'efficiency' property.
      const efficiencies = components
        .map(c => (c as any).efficiency || 0)
        .filter(val => Boolean(val));

      if (!efficiencies.length) return 0;
      return efficiencies.reduce((acc, val) => acc + val, 0) / efficiencies.length;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'SystemAnalysis.calculateEfficiency'
      );
      return 0;
    }
  }

  private async calculatePerformance(): Promise<number> {
    try {
      const performanceData: PerformanceData = await this.performanceService.getCurrentPerformance();
      // Casting performanceData to any in order to retrieve overallPerformance
      return (performanceData as any).overallPerformance || 0;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'SystemAnalysis.calculatePerformance'
      );
      return 0;
    }
  }

  private async calculateReliability(): Promise<number> {
    try {
      const [uptimeData, errorRate] = await Promise.all([
        this.monitoringService.getSystemUptime(),
        this.monitoringService.getErrorRate()
      ]);
      
      const uptimeScore = this.calculateUptimeScore(uptimeData);
      const errorScore = this.calculateErrorScore(errorRate);
      
      return (uptimeScore + errorScore) / 2;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'SystemAnalysis.calculateReliability'
      );
      return 0;
    }
  }

  private async calculateMaintenanceHealth(): Promise<number> {
    try {
      const status = await this.monitoringService.getComponentsStatus();
      const components: Component[] = status[0]?.components || [];
      if (!components.length) return 0;

      const maintenanceScores = components.map(component => 
        this.calculateMaintenanceScore(
          this.getDaysSinceDate(component.lastMaintenance)
        )
      );

      return maintenanceScores.reduce((acc, score) => acc + score, 0) / maintenanceScores.length;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'SystemAnalysis.calculateMaintenanceHealth'
      );
      return 0;
    }
  }

  private calculateUptimeScore(uptimeData: UptimeData): number {
    const uptime = uptimeData.uptime || 0;
    const totalTime = uptimeData.totalTime || 1; // Prevent division by zero
    return (uptime / totalTime) * 100;
  }

  private calculateErrorScore(errorRate: ErrorRateData): number {
    const errors = errorRate.errors || 0;
    const totalOperations = errorRate.totalOperations || 1; // Prevent division by zero
    return 100 - (errors / totalOperations) * 100;
  }

  private getDaysSinceDate(date?: string): number {
    if (!date) return Infinity;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateMaintenanceScore(daysSinceLastMaintenance: number): number {
    const score = 100 - (daysSinceLastMaintenance / SystemAnalysis.MAINTENANCE_INTERVAL_DAYS) * 100;
    return this.normalizeMetric(score);
  }

  private normalizeMetric(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private determineComponentStatus(efficiency: number): ComponentStatus {
    if (efficiency < SystemAnalysis.CRITICAL_EFFICIENCY_THRESHOLD) return 'critical';
    if (efficiency < SystemAnalysis.WARNING_EFFICIENCY_THRESHOLD) return 'warning';
    return 'healthy';
  }
}