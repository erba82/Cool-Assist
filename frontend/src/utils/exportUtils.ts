// src/utils/exportUtils.ts

/**
 * @author erba82
 * @lastModified 2025-02-02 11:50:32
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// اضافه کردن تایپ autoTable به jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// تعریف interface های مورد نیاز
interface Performance {
  cop: number;
  capacityUtilization: number;
}

interface EnergyEfficiency {
  annualConsumption: number;
  efficiencyRatio: number;
}

interface CostAnalysis {
  operatingCosts: number;
  maintenanceCosts: number;
  paybackPeriod: number;
}

export interface AnalysisResult {
  performance: Performance;
  energyEfficiency: EnergyEfficiency;
  costAnalysis: CostAnalysis;
}

export class ExportToPDF {
  static generateSystemReport(data: AnalysisResult): void {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('System Analysis Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    // Performance Section
    doc.setFontSize(16);
    doc.text('Performance Analysis', 20, 50);
    
    // Add performance data
    doc.autoTable({
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ['COP', data.performance.cop.toFixed(2)],
        ['Capacity Utilization', `${(data.performance.capacityUtilization * 100).toFixed(1)}%`]
      ]
    });
    
    // Energy Efficiency Section
    doc.text('Energy Efficiency', 20, doc.lastAutoTable.finalY + 20);
    
    // Add efficiency data
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [['Metric', 'Value']],
      body: [
        ['Annual Consumption', `${data.energyEfficiency.annualConsumption.toFixed(2)} kWh`],
        ['Efficiency Ratio', data.energyEfficiency.efficiencyRatio.toFixed(2)]
      ]
    });
    
    // Cost Analysis Section
    doc.text('Cost Analysis', 20, doc.lastAutoTable.finalY + 20);
    
    // Add cost data
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [['Cost Category', 'Amount']],
      body: [
        ['Operating Costs', `$${data.costAnalysis.operatingCosts.toFixed(2)}`],
        ['Maintenance Costs', `$${data.costAnalysis.maintenanceCosts.toFixed(2)}`],
        ['Payback Period', `${data.costAnalysis.paybackPeriod.toFixed(1)} years`]
      ]
    });
    
    // Save the PDF
    doc.save('system-analysis-report.pdf');
  }
}