// src/types/calculations.ts

/**
 * @author erba82
 * @lastModified 2025-02-02 12:12:45
 */

// HVAC Interfaces
export interface HVACCalculationInput {
  temperature: number;
  humidity: number;
  pressure: number;
  flowRate: number;
}

export interface HVACCalculationResult {
  coolingLoad: number;
  heatingLoad: number;
  dehumidification: number;
  sensibleHeatRatio: number;
}

// Refrigeration Interfaces
export interface RefrigerationCalculationInput {
  coolingCapacity: number;
  evaporatorTemperature: number;
  condenserTemperature: number;
  refrigerantType: string;
  compressorEfficiency: number;
}

export interface RefrigerationCalculationResult {
  cop: number;
  powerConsumption: number;
  massFlow: number;
  compressionRatio: number;
}

// Piping Interfaces
export interface PipingCalculationInput {
  flowRate: number;
  pipeLength: number;
  pipeDiameter: number;
  roughness: number;
  fluidViscosity: number;
}

export interface PipingCalculationResult {
  pressureDrop: number;
  velocity: number;
  reynoldsNumber: number;
  frictionFactor: number;
}

// Heat Exchanger Interfaces
export interface HeatExchangerCalculationInput {
  hotFluidInletTemp: number;
  hotFluidOutletTemp: number;
  coldFluidInletTemp: number;
  coldFluidOutletTemp: number;
  flowRate: number;
  specificHeat: number;
}

export interface HeatExchangerCalculationResult {
  heatTransferRate: number;
  effectiveness: number;
  lmtd: number;
  uaValue: number;
}