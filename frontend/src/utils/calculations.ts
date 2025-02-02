// src/utils/calculations.ts

/**
 * @author erba82
 * @lastModified 2025-02-02 12:10:41
 */

import {
  HVACCalculationInput,
  HVACCalculationResult,
  RefrigerationCalculationInput,
  RefrigerationCalculationResult,
  PipingCalculationInput,
  PipingCalculationResult,
  HeatExchangerCalculationInput,
  HeatExchangerCalculationResult
} from '../types/calculations';

export class EngineeringCalculations {
  // HVAC Calculations
  static calculateHVAC(input: HVACCalculationInput): HVACCalculationResult {
    try {
      const coolingLoad = this.calculateCoolingLoad(input);
      const heatingLoad = this.calculateHeatingLoad(input);
      const dehumidification = this.calculateDehumidificationLoad(input);
      const sensibleHeatRatio = this.calculateSensibleHeatRatio(coolingLoad, dehumidification);

      return {
        coolingLoad,
        heatingLoad,
        dehumidification,
        sensibleHeatRatio
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`HVAC calculation failed: ${error.message}`);
      }
      throw new Error('HVAC calculation failed: Unknown error');
    }
  }

  // Refrigeration Calculations
  static calculateRefrigeration(input: RefrigerationCalculationInput): RefrigerationCalculationResult {
    try {
      const cop = this.calculateCoeffientOfPerformance(input);
      const powerConsumption = input.coolingCapacity / cop;
      const massFlow = this.calculateRefrigerantMassFlow(input);
      const compressionRatio = this.calculateSystemCompressionRatio(input);

      return {
        cop,
        powerConsumption,
        massFlow,
        compressionRatio
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Refrigeration calculation failed: ${error.message}`);
      }
      throw new Error('Refrigeration calculation failed: Unknown error');
    }
  }

  // Helper Methods
  private static calculateCoolingLoad(input: HVACCalculationInput): number {
    const { temperature, humidity, flowRate, pressure } = input;
    return temperature * flowRate * 1.2; // Sample calculation
  }

  private static calculateHeatingLoad(input: HVACCalculationInput): number {
    const { temperature, humidity, flowRate, pressure } = input;
    return temperature * flowRate * 1.1; // Sample calculation
  }

  private static calculateDehumidificationLoad(input: HVACCalculationInput): number {
    const { temperature, humidity, flowRate } = input;
    return humidity * flowRate * 0.0846; // Sample calculation
  }

  private static calculateSensibleHeatRatio(coolingLoad: number, dehumidification: number): number {
    return coolingLoad / (coolingLoad + dehumidification);
  }

  private static calculateCoeffientOfPerformance(input: RefrigerationCalculationInput): number {
    const { evaporatorTemperature, condenserTemperature, compressorEfficiency } = input;
    const absoluteEvapTemp = evaporatorTemperature + 273.15; // Convert to Kelvin
    const absoluteCondTemp = condenserTemperature + 273.15;
    return (compressorEfficiency * absoluteEvapTemp) / (absoluteCondTemp - absoluteEvapTemp);
  }

  private static calculateRefrigerantMassFlow(input: RefrigerationCalculationInput): number {
    const { coolingCapacity, refrigerantType } = input;
    return coolingCapacity * 0.025; // Sample calculation based on refrigerant type
  }

  private static calculateSystemCompressionRatio(input: RefrigerationCalculationInput): number {
    const { evaporatorTemperature, condenserTemperature } = input;
    return (condenserTemperature + 273.15) / (evaporatorTemperature + 273.15);
  }
}

// Validators
export const validateHVACInput = (input: HVACCalculationInput): boolean => {
  if (input.temperature < -50 || input.temperature > 50) return false;
  if (input.humidity < 0 || input.humidity > 100) return false;
  if (input.pressure <= 0) return false;
  if (input.flowRate <= 0) return false;
  return true;
};

export const validateRefrigerationInput = (input: RefrigerationCalculationInput): boolean => {
  if (!input.evaporatorTemperature || !input.condenserTemperature || 
      !input.coolingCapacity || !input.refrigerantType || 
      !input.compressorEfficiency) {
    return false;
  }
  
  if (input.evaporatorTemperature < -50 || input.evaporatorTemperature > 30) return false;
  if (input.condenserTemperature <= input.evaporatorTemperature) return false;
  if (input.coolingCapacity <= 0) return false;
  if (input.compressorEfficiency <= 0 || input.compressorEfficiency > 1) return false;
  
  return true;
};