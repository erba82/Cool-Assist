// src/utils/unitConverter.ts
export class UnitConverter {
    private static readonly unitFactors = {
      // دما
      temperature: {
        'C': 0,
        'F': 32,
        'K': 273.15,
        'R': 491.67
      },
      // فشار
      pressure: {
        'kPa': 1,
        'bar': 100,
        'psi': 6.89476,
        'MPa': 1000
      },
      // طول
      length: {
        'm': 1,
        'ft': 0.3048,
        'in': 0.0254,
        'mm': 0.001
      },
      // جرم
      mass: {
        'kg': 1,
        'lb': 0.453592,
        'g': 0.001,
        'oz': 0.0283495
      }
    };
  
    static convert(value: number, fromUnit: string, toUnit: string): number {
      // تشخیص نوع واحد
      const unitType = this.getUnitType(fromUnit, toUnit);
      
      if (unitType === 'temperature') {
        return this.convertTemperature(value, fromUnit, toUnit);
      }
  
      const fromFactor = this.unitFactors[unitType][fromUnit];
      const toFactor = this.unitFactors[unitType][toUnit];
      
      return (value * fromFactor) / toFactor;
    }
  
    private static convertTemperature(value: number, fromUnit: string, toUnit: string): number {
      let kelvin: number;
  
      // تبدیل به کلوین
      switch (fromUnit) {
        case 'C':
          kelvin = value + 273.15;
          break;
        case 'F':
          kelvin = (value + 459.67) * 5/9;
          break;
        case 'K':
          kelvin = value;
          break;
        case 'R':
          kelvin = value * 5/9;
          break;
        default:
          throw new Error('Invalid temperature unit');
      }
  
      // تبدیل از کلوین
      switch (toUnit) {
        case 'C':
          return kelvin - 273.15;
        case 'F':
          return kelvin * 9/5 - 459.67;
        case 'K':
          return kelvin;
        case 'R':
          return kelvin * 9/5;
        default:
          throw new Error('Invalid temperature unit');
      }
    }
  }