// src/utils/calculationValidator.ts

/**
 * @author erba82
 * @lastModified 2025-02-02 11:56:06
 */

interface RefrigerationData {
  compressorWork: number;
  evaporatorCapacity: number;
  condenserHeat: number;
  refrigerantMassFlow: number;
}

interface HeatTransferData {
  temperature: number;
  surfaceArea: number;
  heatTransferCoefficient: number;
  deltaT: number;
}

type CalculationMethod = 'refrigerationCycle' | 'heatTransfer';

export class CalculationValidator {
  private static readonly TOLERANCE = 0.001; // 0.1% tolerance

  static validateResults(calculation: RefrigerationData | HeatTransferData, method: CalculationMethod): boolean {
    // اول با روش اصلی محاسبه می‌کنیم
    const primaryResult = this.calculateWithPrimaryMethod(calculation, method);
    
    // سپس با روش ثانویه محاسبه می‌کنیم
    const secondaryResult = this.calculateWithSecondaryMethod(calculation, method);
    
    // مقایسه نتایج با درصد خطای قابل قبول
    return this.compareResults(primaryResult, secondaryResult);
  }

  private static compareResults(primary: number, secondary: number): boolean {
    const difference = Math.abs((primary - secondary) / primary);
    return difference <= this.TOLERANCE;
  }

  private static calculateWithPrimaryMethod(data: RefrigerationData | HeatTransferData, method: CalculationMethod): number {
    switch (method) {
      case 'refrigerationCycle':
        return this.refrigerationCyclePrimary(data as RefrigerationData);
      case 'heatTransfer':
        return this.heatTransferPrimary(data as HeatTransferData);
      default:
        throw new Error(`Unsupported calculation method: ${method}`);
    }
  }

  private static calculateWithSecondaryMethod(data: RefrigerationData | HeatTransferData, method: CalculationMethod): number {
    switch (method) {
      case 'refrigerationCycle':
        return this.refrigerationCycleSecondary(data as RefrigerationData);
      case 'heatTransfer':
        return this.heatTransferSecondary(data as HeatTransferData);
      default:
        throw new Error(`Unsupported calculation method: ${method}`);
    }
  }

  private static refrigerationCyclePrimary(data: RefrigerationData): number {
    const { compressorWork, evaporatorCapacity } = data;
    // روش اول محاسبه COP برای سیکل تبرید
    return evaporatorCapacity / compressorWork;
  }

  private static refrigerationCycleSecondary(data: RefrigerationData): number {
    const { condenserHeat, compressorWork } = data;
    // روش دوم محاسبه COP برای سیکل تبرید
    return (condenserHeat - compressorWork) / compressorWork;
  }

  private static heatTransferPrimary(data: HeatTransferData): number {
    const { surfaceArea, heatTransferCoefficient, deltaT } = data;
    // روش اول محاسبه انتقال حرارت
    return heatTransferCoefficient * surfaceArea * deltaT;
  }

  private static heatTransferSecondary(data: HeatTransferData): number {
    const { temperature, surfaceArea, heatTransferCoefficient } = data;
    // روش دوم محاسبه انتقال حرارت با استفاده از دمای مطلق
    const absoluteTemp = temperature + 273.15; // تبدیل به کلوین
    return heatTransferCoefficient * surfaceArea * absoluteTemp * 0.001;
  }
}