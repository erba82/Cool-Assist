/**
 * @author erba82
 * @lastModified 2025-02-08 07:05:00
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    
    // اضافه کردن header
    doc.setFontSize(20);
    doc.text('گزارش تجزیه و تحلیل سیستم', 20, 20);
    
    // اضافه کردن تاریخ
    doc.setFontSize(12);
    doc.text(`تاریخ گزارش: ${new Date().toLocaleString()}`, 20, 30);
    
    // بخشی برای تجزیه و تحلیل عملکرد
    doc.setFontSize(16);
    doc.text('تجزیه و تحلیل عملکرد', 20, 50);
    
    // افزودن اطلاعات عملکرد
    doc.autoTable({
      startY: 60,
      head: [['شاخص', 'مقدار']],
      body: [
        ['COP', data.performance.cop.toFixed(2)],
        ['ظرفیت استفاده‌شده', `${(data.performance.capacityUtilization * 100).toFixed(1)}%`]
      ]
    });
    
    // استفاده از مقدار نهایی جدول قبلی به صورت ایمن با fallback
    const lastYAfterPerformance = doc.lastAutoTable?.finalY ?? 60;
    
    // بخشی برای بهینه‌سازی مصرف انرژی
    doc.text('بهینه‌سازی مصرف انرژی', 20, lastYAfterPerformance + 20);
    
    // افزودن اطلاعات مصرف انرژی
    doc.autoTable({
      startY: (doc.lastAutoTable?.finalY ?? lastYAfterPerformance) + 30,
      head: [['شاخص', 'مقدار']],
      body: [
        ['مصرف سالانه', `${data.energyEfficiency.annualConsumption.toFixed(2)} kWh`],
        ['ضریب کارایی', data.energyEfficiency.efficiencyRatio.toFixed(2)]
      ]
    });
    
    // استفاده از مقدار نهایی جدول قبلی به صورت ایمن با fallback
    const lastYAfterEfficiency = doc.lastAutoTable?.finalY ?? (lastYAfterPerformance + 30);
    
    // بخشی برای تجزیه و تحلیل هزینه‌ها
    doc.text('تجزیه و تحلیل هزینه‌ها', 20, lastYAfterEfficiency + 20);
    
    // افزودن اطلاعات هزینه‌ها
    doc.autoTable({
      startY: (doc.lastAutoTable?.finalY ?? (lastYAfterEfficiency + 20)) + 30,
      head: [['دسته‌بندی هزینه', 'مقدار']],
      body: [
        ['هزینه‌های عملیاتی', `$${data.costAnalysis.operatingCosts.toFixed(2)}`],
        ['هزینه‌های نگهداری', `$${data.costAnalysis.maintenanceCosts.toFixed(2)}`],
        ['دوره بازپرداخت', `${data.costAnalysis.paybackPeriod.toFixed(1)} سال`]
      ]
    });
    
    // ذخیره PDF
    doc.save('system-analysis-report.pdf');
  }
}