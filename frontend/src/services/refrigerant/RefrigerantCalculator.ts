/**
 * کلاس RefrigerantCalculator برای محاسبه فشار بر اساس دمای مبرد است.
 * می‌توانید منطق محاسباتی را با توجه به نیازهای پروژه تغییر دهید.
 */
export class RefrigerantCalculator {
    public getPressureFromTemperature(refrigerant: string, temperature: number): number {
      // این یک محاسبه ساده است؛ در صورت نیاز فرمول دقیق‌تر جایگزین شود.
      const coefficient = 2;
      const offset = 100;
      return temperature * coefficient + offset;
    }
  }