// src/data/refrigerants.ts
export interface RefrigerantProperties {
    name: string;
    number: string;
    chemicalFormula: string;
    criticalPoint: {
      temperature: number;
      pressure: number;
    };
    safetyGroup: string;
    gwp: number;
    odp: number;
    properties: {
      temperature: number[];
      pressure: number[];
      liquidDensity: number[];
      vaporDensity: number[];
      liquidEnthalpy: number[];
      vaporEnthalpy: number[];
      liquidEntropy: number[];
      vaporEntropy: number[];
    };
  }
  
  export const refrigerants: { [key: string]: RefrigerantProperties } = {
    'R717': {
      name: 'Ammonia',
      number: 'R717',
      chemicalFormula: 'NH3',
      criticalPoint: {
        temperature: 132.25,
        pressure: 11.333
      },
      safetyGroup: 'B2L',
      gwp: 0,
      odp: 0,
      properties: {
        // Detailed property arrays
      }
    },
    'R134a': {
      // Properties for R134a
    },
    'R404A': {
      // Properties for R404A
    },
    // Add more refrigerants
  };
  
  export class RefrigerantCalculator {
    static getProperties(refrigerantType: string, temperature: number): any {
      const refrigerant = refrigerants[refrigerantType];
      if (!refrigerant) {
        throw new Error('Refrigerant not found');
      }
  
      // Interpolate properties based on temperature
      return this.interpolateProperties(refrigerant, temperature);
    }
  
    private static interpolateProperties(refrigerant: RefrigerantProperties, temperature: number): any {
      // Implementation of property interpolation
    }
  }