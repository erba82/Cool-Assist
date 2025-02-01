interface RefrigerantProperty {
  evaporatorEnthalpy: number;
  condenserEnthalpy: number;
  pressure: {
    evaporator: number;
    condenser: number;
  };
  temperature: {
    evaporator: number;
    condenser: number;
  };
}

export class RefrigerantProperties {
  private static readonly REFRIGERANT_DATA = {
    'R134a': {
      molecularMass: 102.03,
      criticalTemp: 374.21,
      criticalPressure: 4059.3,
      normalBoilingPoint: 247.08,
      coefficients: {
        a: 0.0000382,
        b: -0.0219,
        c: 3.7429,
        d: -85.782
      }
    },
    'R410A': {
      molecularMass: 72.585,
      criticalTemp: 344.494,
      criticalPressure: 4901.2,
      normalBoilingPoint: 221.706,
      coefficients: {
        a: 0.0000428,
        b: -0.0246,
        c: 4.2346,
        d: -97.543
      }
    }
    // Add more refrigerants as needed
  };

  static async getProperties(
    refrigerantType: string,
    evaporatorTemp: number,
    condenserTemp: number
  ): Promise<RefrigerantProperty> {
    try {
      const refrigerant = this.REFRIGERANT_DATA[refrigerantType as keyof typeof this.REFRIGERANT_DATA];
      if (!refrigerant) {
        throw new Error(`Unsupported refrigerant type: ${refrigerantType}`);
      }

      // Calculate saturated pressures using Antoine equation
      const evapPressure = this.calculateSaturatedPressure(refrigerant, evaporatorTemp);
      const condPressure = this.calculateSaturatedPressure(refrigerant, condenserTemp);

      // Calculate enthalpies
      const evapEnthalpy = this.calculateEnthalpy(refrigerant, evaporatorTemp, evapPressure, 'vapor');
      const condEnthalpy = this.calculateEnthalpy(refrigerant, condenserTemp, condPressure, 'liquid');

      return {
        evaporatorEnthalpy: evapEnthalpy,
        condenserEnthalpy: condEnthalpy,
        pressure: {
          evaporator: evapPressure,
          condenser: condPressure
        },
        temperature: {
          evaporator: evaporatorTemp,
          condenser: condenserTemp
        }
      };
    } catch (error) {
      console.error('Error calculating refrigerant properties:', error);
      throw new Error('Failed to calculate refrigerant properties');
    }
  }

  private static calculateSaturatedPressure(
    refrigerant: typeof RefrigerantProperties.REFRIGERANT_DATA.R134a,
    temperature: number
  ): number {
    const T = temperature + 273.15; // Convert to Kelvin
    const { a, b, c, d } = refrigerant.coefficients;
    
    // Modified Antoine equation
    return Math.exp(a * T ** 3 + b * T ** 2 + c * T + d);
  }

  private static calculateEnthalpy(
    refrigerant: typeof RefrigerantProperties.REFRIGERANT_DATA.R134a,
    temperature: number,
    pressure: number,
    phase: 'liquid' | 'vapor'
  ): number {
    // Simplified enthalpy calculation
    // In a real application, this would use more complex equations or lookup tables
    const T = temperature + 273.15;
    const Tc = refrigerant.criticalTemp;
    const Pc = refrigerant.criticalPressure;
    
    if (phase === 'vapor') {
      return (2500 + 1.9 * (T - 273.15)) * (1 - 0.3 * (pressure / Pc));
    } else {
      return (200 + 4.2 * (T - 273.15)) * (1 + 0.1 * (pressure / Pc));
    }
  }

  static validateTemperatureRange(
    refrigerantType: string,
    temperature: number
  ): boolean {
    const refrigerant = this.REFRIGERANT_DATA[refrigerantType as keyof typeof this.REFRIGERANT_DATA];
    if (!refrigerant) return false;

    return temperature < (refrigerant.criticalTemp - 273.15) &&
           temperature > (refrigerant.normalBoilingPoint - 273.15);
  }
}