import { MonitoringService } from '../services/monitoringService';
import { PerformanceService } from '../services/performance/PerformanceService';
import { ErrorHandler } from '../services/errorHandling/ErrorHandler';

interface SystemMetrics {
  efficiency: number;
  performance: number;
  reliability: number;
  maintenance: number;
}

interface ComponentHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastMaintenance: Date;
  efficiency: number;
}

export class SystemAnalysis {
  private monitoringService: MonitoringService;
  private performanceService: PerformanceService;

  constructor() {
    this.monitoringService = new MonitoringService();
    this.performanceService = new PerformanceService();
  }

  async getCurrentMetrics(): Promise<SystemMetrics> {
    try {
      const [
        efficiencyData,
        performanceData,
        reliabilityData,
        maintenanceData
      ] = await Promise.all([
        this.calculateEfficiency(),
        this.calculatePerformance(),
        this.calculateReliability(),
        this.calculateMaintenanceHealth()
      ]);

      return {
        efficiency: this.normalizeMetric(efficiencyData),
        performance: this.normalizeMetric(performanceData),
        reliability: this.normalizeMetric(reliabilityData),
        maintenance: this.normalizeMetric(maintenanceData)
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'SystemAnalysis.getCurrentMetrics');
      throw error;
    }
  }

  private async calculateEfficiency(): Promise<number> {
    try {
      const components = await this.monitoringService.getComponentsStatus();
      const efficiencies = components.map(c => c.efficiency);
      return efficiencies.reduce((acc, val) => acc + val, 0) / efficiencies.length;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'SystemAnalysis.calculateEfficiency');
      return 0;
    }
  }

  private async calculatePerformance(): Promise<number> {
    try {
      const performanceData = await this.performanceService.getCurrentPerformance();
      return performanceData.overallPerformance;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'SystemAnalysis.calculatePerformance');
      return 0;
    }
  }

  private async calculateReliability(): Promise<number> {
    try {
      const uptimeData = await this.monitoringService.getSystemUptime();
      const errorRate = await this.monitoringService.getErrorRate();
      
      // Calculate reliability score based on uptime and error rate
      const uptimeScore = (uptimeData.uptime / uptimeData.totalTime) * 100;
      const errorScore = 100 - (errorRate.errors / errorRate.totalOperations) * 100;
      
      return (uptimeScore + errorScore) / 2;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'SystemAnalysis.calculateReliability');
      return 0;
    }
  }

  private async calculateMaintenanceHealth(): Promise<number> {
    try {
      const components = await this.monitoringService.getComponentsStatus();
      let totalHealth = 0;

      components.forEach(component => {
        const daysSinceLastMaintenance = this.getDaysSinceDate(component.lastMaintenance);
        const maintenanceScore = this.calculateMaintenanceScore(daysSinceLastMaintenance);
        totalHealth += maintenanceScore;
      });

      return totalHealth / components.length;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'SystemAnalysis.calculateMaintenanceHealth');
      return 0;
    }
  }

  private getDaysSinceDate(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateMaintenanceScore(daysSinceLastMaintenance: number): number {
    const maxDays = 90; // Assume maintenance is needed every 90 days
    const score = 100 - (daysSinceLastMaintenance / maxDays) * 100;
    return Math.max(0, Math.min(100, score));
  }

  private normalizeMetric(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  async getComponentHealth(): Promise<ComponentHealth[]> {
    try {
      const components = await this.monitoringService.getComponentsStatus();
      return components.map(component => ({
        id: component.id,
        name: component.name,
        status: this.determineComponentStatus(component),
        lastMaintenance: component.lastMaintenance,
        efficiency: component.efficiency
      }));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'SystemAnalysis.getComponentHealth');
      return [];
    }
  }

  private determineComponentStatus(component: any): 'healthy' | 'warning' | 'critical' {
    if (component.efficiency < 60) return 'critical';
    if (component.efficiency < 80) return 'warning';
    return 'healthy';
  }
}