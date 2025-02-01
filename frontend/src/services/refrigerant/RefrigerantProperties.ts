// src/services/refrigerant/RefrigerantProperties.ts
export class RefrigerantProperties {
    private static readonly pressureTemperatureData = {
      'R134a': [
        { temp: -40, pressure: 0.51 },
        { temp: -35, pressure: 0.71 },
        // ... complete pressure-temperature data
      ],
      // ... other refrigerants
    };
  
    static getPressureFromTemperature(refrigerant: string, temperature: number): number {
      const data = this.pressureTemperatureData[refrigerant];
      if (!data) throw new Error('Refrigerant not found');
  
      // Interpolation between known points
      const lowerPoint = data.find(point => point.temp <= temperature);
      const upperPoint = data.find(point => point.temp > temperature);
      
      if (!lowerPoint || !upperPoint) {
        throw new Error('Temperature out of range');
      }
  
      return this.interpolate(
        temperature,
        lowerPoint.temp,
        upperPoint.temp,
        lowerPoint.pressure,
        upperPoint.pressure
      );
    }
  
    static getTemperatureFromPressure(refrigerant: string, pressure: number): number {
      // Similar interpolation for temperature from pressure
    }
  
    private static interpolate(
      x: number,
      x1: number,
      x2: number,
      y1: number,
      y2: number
    ): number {
      return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
    }
  }