// src/tests/Integration.test.ts
import { RefrigerantCalculator } from '../services/refrigerant/RefrigerantCalculator';
import { ElectricalCalculations } from '../services/calculations/ElectricalCalculations';
import { SecurityService } from '../services/security/SecurityService';

describe('Integration Tests', () => {
  test('Refrigerant Calculations', () => {
    const calc = new RefrigerantCalculator();
    const result = calc.getPressureFromTemperature('R134a', 25);
    expect(result).toBeGreaterThan(0);
  });

  test('Electrical Calculations', () => {
    const result = ElectricalCalculations.calculatePower({
      voltage: 220,
      current: 10,
      powerFactor: 0.85,
      phase: 1
    });
    expect(result).toBe(1870);
  });

  test('Security Features', () => {
    const data = { test: 'data' };
    const key = 'testKey';
    const encrypted = SecurityService.encryptData(data, key);
    const decrypted = SecurityService.decryptData(encrypted, key);
    expect(decrypted).toEqual(data);
  });
});