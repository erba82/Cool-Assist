// src/utils/validators/calculationValidators.ts
import { HVACCalculationInput, RefrigerationCalculationInput } from '../../types/calculations';

export class CalculationValidator {
  static validateHVACInput(input: HVACCalculationInput): void {
    const errors: string[] = [];

    if (input.temperature < -50 || input.temperature > 50) {
      errors.push('Temperature must be between -50°C and 50°C');
    }

    if (input.humidity < 0 || input.humidity > 100) {
      errors.push('Humidity must be between 0% and 100%');
    }

    if (input.pressure <= 0) {
      errors.push('Pressure must be greater than 0 Pa');
    }

    if (input.flowRate <= 0) {
      errors.push('Flow rate must be greater than 0 m³/h');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid HVAC input: ${errors.join(', ')}`);
    }
  }

  // سایر متدهای validation...
}