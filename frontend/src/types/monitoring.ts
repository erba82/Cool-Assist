// src/types/monitoring.ts

/**
 * @author erba82
 * @lastModified 2025-02-02 13:54:53
 */

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  timestamp: Date;
}

export interface PerformanceThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  responseTime: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
}

export interface PerformanceData {
  timestamp: Date;
  metrics: PerformanceMetrics;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  componentId?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface SystemStatus {
  timestamp: string;
  lastMaintenance: string;
  components: Component[];
}

export interface SystemStatusResponse extends SystemStatus {
  additionalInfo?: any;
}

export interface Component {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'failed';
  lastMaintenance: string;
}

export interface UptimeData {
  timestamp: Date;
  uptime: number;
  totalTime: number;
  lastDowntime?: string;
}

export interface ErrorRateData {
  timestamp: Date;
  total: number;
  critical: number;
  warning: number;
  errorRate: number;
  errors: number;
  totalOperations: number;
}

export interface SystemMetrics {
  efficiency: number;
  performance: number;
  reliability: number;
  maintenance: number;
}

export interface OptimizationSuggestion {
  id: string;
  parameter: string;
  currentValue: number;
  suggestedValue: number;
  expectedImprovement: number;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementationSteps: string[];
  impact: 'high' | 'medium' | 'low';
}