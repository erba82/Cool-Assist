// src/utils/calculationValidator.ts
export class CalculationValidator {
    static validateResults(calculation: any, method: string): boolean {
      // اول با روش اصلی محاسبه می‌کنیم
      const primaryResult = this.calculateWithPrimaryMethod(calculation, method);
      
      // سپس با روش ثانویه محاسبه می‌کنیم
      const secondaryResult = this.calculateWithSecondaryMethod(calculation, method);
      
      // مقایسه نتایج با درصد خطای قابل قبول
      return this.compareResults(primaryResult, secondaryResult);
    }
  
    private static compareResults(primary: number, secondary: number): boolean {
      const tolerance = 0.001; // 0.1% tolerance
      const difference = Math.abs((primary - secondary) / primary);
      return difference <= tolerance;
    }
  
    // Methods for different calculation approaches
    private static calculateWithPrimaryMethod(data: any, method: string) {
      switch (method) {
        case 'refrigerationCycle':
          return this.refrigerationCyclePrimary(data);
        case 'heatTransfer':
          return this.heatTransferPrimary(data);
        // Add more methods as needed
      }
    }
  
    private static calculateWithSecondaryMethod(data: any, method: string) {
      switch (method) {
        case 'refrigerationCycle':
          return this.refrigerationCycleSecondary(data);
        case 'heatTransfer':
          return this.heatTransferSecondary(data);
        // Add more methods as needed
      }
    }
  }