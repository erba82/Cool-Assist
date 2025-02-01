interface HVACLoadInput {
  area: number;
  volume: number;
  occupants: number;
  windows: number;
  outsideTemp: number;
  desiredTemp: number;
  humidity: number;
  buildingType: string;
}

interface HVACLoadOutput {
  coolingLoad: number;
  heatingLoad: number;
  ventilationRate: number;
  dehumidification: number;
  recommendedSystem: string;
}

export class HVACCalculations {
  private readonly COOLING_LOAD_FACTORS = {
    residential: 100, // W/m²
    commercial: 150,  // W/m²
    industrial: 200   // W/m²
  };

  private readonly HEATING_LOAD_FACTORS = {
    residential: 80,  // W/m²
    commercial: 100,  // W/m²
    industrial: 120   // W/m²
  };

  private readonly VENTILATION_RATES = {
    residential: 30,  // m³/h per person
    commercial: 40,   // m³/h per person
    industrial: 50    // m³/h per person
  };

  private readonly WINDOW_LOAD_FACTOR = 200; // W per window
  private readonly OCCUPANT_LOAD = 100;      // W per person
  private readonly SAFETY_FACTOR = 1.1;      // 10% safety margin

  async calculateLoads(input: HVACLoadInput): Promise<HVACLoadOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Calculate base loads
      const baseCoolingLoad = this.calculateBaseCoolingLoad(input);
      const baseHeatingLoad = this.calculateBaseHeatingLoad(input);

      // Calculate additional loads
      const windowLoad = this.calculateWindowLoad(input.windows);
      const occupantLoad = this.calculateOccupantLoad(input.occupants);
      const temperatureDifferentialLoad = this.calculateTemperatureDifferentialLoad(
        input.outsideTemp,
        input.desiredTemp,
        input.area
      );

      // Calculate final loads with safety factor
      const totalCoolingLoad = (baseCoolingLoad + windowLoad + occupantLoad + temperatureDifferentialLoad) * this.SAFETY_FACTOR;
      const totalHeatingLoad = (baseHeatingLoad + temperatureDifferentialLoad) * this.SAFETY_FACTOR;

      // Calculate ventilation requirements
      const ventilationRate = this.calculateVentilationRate(input);

      // Calculate dehumidification requirement
      const dehumidification = this.calculateDehumidification(input);

      // Determine recommended system
      const recommendedSystem = this.determineRecommendedSystem(totalCoolingLoad, totalHeatingLoad, input.buildingType);

      return {
        coolingLoad: totalCoolingLoad / 1000, // Convert to kW
        heatingLoad: totalHeatingLoad / 1000, // Convert to kW
        ventilationRate,
        dehumidification,
        recommendedSystem
      };
    } catch (error) {
      console.error('HVAC calculation error:', error);
      throw error;
    }
  }

  private validateInput(input: HVACLoadInput): void {
    if (input.area <= 0) throw new Error('Area must be positive');
    if (input.volume <= 0) throw new Error('Volume must be positive');
    if (input.occupants < 0) throw new Error('Occupants cannot be negative');
    if (input.windows < 0) throw new Error('Windows cannot be negative');
    if (input.humidity < 0 || input.humidity > 100) throw new Error('Humidity must be between 0 and 100');
    if (!['residential', 'commercial', 'industrial'].includes(input.buildingType)) {
      throw new Error('Invalid building type');
    }
  }

  private calculateBaseCoolingLoad(input: HVACLoadInput): number {
    return input.area * this.COOLING_LOAD_FACTORS[input.buildingType as keyof typeof this.COOLING_LOAD_FACTORS];
  }

  private calculateBaseHeatingLoad(input: HVACLoadInput): number {
    return input.area * this.HEATING_LOAD_FACTORS[input.buildingType as keyof typeof this.HEATING_LOAD_FACTORS];
  }

  private calculateWindowLoad(windows: number): number {
    return windows * this.WINDOW_LOAD_FACTOR;
  }

  private calculateOccupantLoad(occupants: number): number {
    return occupants * this.OCCUPANT_LOAD;
  }

  private calculateTemperatureDifferentialLoad(outsideTemp: number, desiredTemp: number, area: number): number {
    const temperatureDifference = Math.abs(outsideTemp - desiredTemp);
    return temperatureDifference * area * 10; // 10 W/m²/°C is a typical value
  }

  private calculateVentilationRate(input: HVACLoadInput): number {
    const baseRate = this.VENTILATION_RATES[input.buildingType as keyof typeof this.VENTILATION_RATES];
    return baseRate * input.occupants;
  }

  private calculateDehumidification(input: HVACLoadInput): number {
    // Simplified dehumidification calculation
    if (input.humidity > 60) {
      return (input.humidity - 60) * input.volume * 0.1;
    }
    return 0;
  }

  private determineRecommendedSystem(coolingLoad: number, heatingLoad: number, buildingType: string): string {
    const totalLoad = (coolingLoad + heatingLoad) / 1000; // Convert to kW

    if (buildingType === 'residential') {
      if (totalLoad < 10) {
        return 'Split System Air Conditioner with Heat Pump';
      } else if (totalLoad < 20) {
        return 'Multi-Split System with Heat Recovery';
      } else {
        return 'Central HVAC System with VRF Technology';
      }
    } else if (buildingType === 'commercial') {
      if (totalLoad < 50) {
        return 'Rooftop Package Unit with Economizer';
      } else if (totalLoad < 100) {
        return 'VRF System with Heat Recovery';
      } else {
        return 'Central Plant with Air Handling Units';
      }
    } else { // industrial
      if (totalLoad < 150) {
        return 'Industrial Package Unit with Custom Controls';
      } else {
        return 'Custom Engineered HVAC System with Energy Recovery';
      }
    }
  }
}