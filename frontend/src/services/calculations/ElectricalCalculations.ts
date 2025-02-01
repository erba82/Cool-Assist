// src/services/calculations/ElectricalCalculations.ts
export class ElectricalCalculations {
    // محاسبات جریان و توان
    static calculatePower(params: {
      voltage: number;
      current: number;
      powerFactor: number;
      phase: 1 | 3;
    }): number {
      const { voltage, current, powerFactor, phase } = params;
      return phase === 1 
        ? voltage * current * powerFactor 
        : Math.sqrt(3) * voltage * current * powerFactor;
    }
  
    // محاسبه سایز کابل
    static calculateCableSize(params: {
      current: number;
      length: number;
      voltageDrop: number;
      material: 'copper' | 'aluminum';
    }): number {
      const { current, length, voltageDrop, material } = params;
      const resistivity = material === 'copper' ? 0.0171 : 0.0282;
      return (2 * resistivity * length * current) / voltageDrop;
    }
  
    // محاسبه سایز فیوز و کلید
    static calculateBreakerSize(fullLoadAmperage: number): number {
      const standardSizes = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
      const minSize = fullLoadAmperage * 1.25;
      return standardSizes.find(size => size >= minSize) || standardSizes[standardSizes.length - 1];
    }
  }