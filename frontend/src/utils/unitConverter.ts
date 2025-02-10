type UnitType = 'temperature' | 'pressure' | 'length' | 'mass';

type TemperatureUnit = 'C' | 'F' | 'K' | 'R';
type PressureUnit = 'kPa' | 'bar' | 'psi' | 'MPa';
type LengthUnit = 'm' | 'ft' | 'in' | 'mm';
type MassUnit = 'kg' | 'lb' | 'g' | 'oz';

type Unit = TemperatureUnit | PressureUnit | LengthUnit | MassUnit;

type UnitFactors = {
  temperature: Record<TemperatureUnit, number>;
  pressure: Record<PressureUnit, number>;
  length: Record<LengthUnit, number>;
  mass: Record<MassUnit, number>;
};

class UnitConverter {
  private unitFactors: UnitFactors = {
    temperature: { C: 1, F: 1.8, K: 1, R: 1.8 },
    pressure: { kPa: 1, bar: 100, psi: 6.895, MPa: 1000 },
    length: { m: 1, ft: 0.3048, in: 0.0254, mm: 0.001 },
    mass: { kg: 1, lb: 0.4536, g: 0.001, oz: 0.02835 }
  };

  /**
   * Convert a value from one unit to another.
   *
   * @param value - numerical value to convert
   * @param fromUnit - original unit
   * @param toUnit - target unit
   * @param unitType - type of unit conversion (temperature, pressure, length, mass)
   * @returns the converted value
   */
  convert(value: number, fromUnit: Unit, toUnit: Unit, unitType: UnitType): number {
    try {
      const fromFactor = this.unitFactors[unitType][fromUnit as keyof typeof this.unitFactors[typeof unitType]];
      const toFactor = this.unitFactors[unitType][toUnit as keyof typeof this.unitFactors[typeof unitType]];
      return (value * fromFactor) / toFactor;
    } catch (error) {
      throw new Error(`Invalid conversion: ${fromUnit} to ${toUnit} for type ${unitType}`);
    }
  }

  // Add additional methods if needed
}

export default new UnitConverter();