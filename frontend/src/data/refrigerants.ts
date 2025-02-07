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
        temperature: [],
        pressure: [],
        liquidDensity: [],
        vaporDensity: [],
        liquidEnthalpy: [],
        vaporEnthalpy: [],
        liquidEntropy: [],
        vaporEntropy: []
      }
    },
    'R134a': {
      name: '1,1,1,2-Tetrafluoroethane',
      number: 'R134a',
      chemicalFormula: 'CH2FCF3',
      criticalPoint: {
        temperature: 101.06,
        pressure: 40.59
      },
      safetyGroup: 'A1',
      gwp: 1430,
      odp: 0,
      properties: {
        temperature: [],
        pressure: [],
        liquidDensity: [],
        vaporDensity: [],
        liquidEnthalpy: [],
        vaporEnthalpy: [],
        liquidEntropy: [],
        vaporEntropy: []
      }
    },
    'R404A': {
      name: 'R404A',
      number: 'R404A',
      chemicalFormula: 'CH2FCF3/CF3CHF2/CF3CH3',
      criticalPoint: {
        temperature: 72.14,
        pressure: 37.35
      },
      safetyGroup: 'A1',
      gwp: 3922,
      odp: 0,
      properties: {
        temperature: [],
        pressure: [],
        liquidDensity: [],
        vaporDensity: [],
        liquidEnthalpy: [],
        vaporEnthalpy: [],
        liquidEntropy: [],
        vaporEntropy: []
      }
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