/**
 * کلاس ElectricalCalculations شامل توابعی برای محاسبه توان، سایز کابل و سایز فیوز/کلید است.
 */
export class ElectricalCalculations {
  /**
   * محاسبه توان الکتریکی بر اساس ولتاژ، جریان، فاکتور قدرت و تعداد فاز.
   * برای سیستم تک فاز: توان = ولتاژ * جریان * فاکتور قدرت
   * برای سیستم سه فاز: توان = √3 * ولتاژ * جریان * فاکتور قدرت
   *
   * @param params - شامل ولتاژ، جریان، فاکتور قدرت و تعداد فاز (۱ یا ۳)
   * @returns توان محاسبه شده
   */
  static calculatePower(params: {
    voltage: number;
    current: number;
    powerFactor: number;
    phase: 1 | 3;
  }): number {
    const { voltage, current, powerFactor, phase } = params;
    return phase === 1 
      ? voltage * current * powerFactor 
      : Math.sqrt(3) * voltage * current * powerFactor;
  }

  /**
   * محاسبه سایز کابل براساس جریان، طول کابل، افت ولتاژ مجاز و جنس کابل.
   * فرمول به کار رفته برای محاسبه بر اساس مدلی ساده از افت ولتاژ است.
   *
   * @param params - شامل جریان، طول کابل، افت ولتاژ و جنس کابل (مس یا آلومینیوم)
   * @returns سایز کابل محاسبه شده بر حسب مقطع کابل (ممکن است نیاز به تنظیم واحدها داشته باشید)
   */
  static calculateCableSize(params: {
    current: number;
    length: number;
    voltageDrop: number;
    material: 'copper' | 'aluminum';
  }): number {
    const { current, length, voltageDrop, material } = params;
    // ضریب مقاومت برای مس و آلومینیوم (Ω·mm²/m)
    const resistivity = material === 'copper' ? 0.0171 : 0.0282;
    return (2 * resistivity * length * current) / voltageDrop;
  }

  /**
   * محاسبه سایز فیوز یا کلید بر اساس جریان بار کامل.
   * سایز انتخاب شده اولین سایزی از لیست استاندارد است که حداقل برابر با 125% جریان بار می‌باشد.
   *
   * @param fullLoadAmperage - جریان بار کامل
   * @returns سایز فیوز/کلید انتخاب شده از لیست استاندارد
   */
  static calculateBreakerSize(fullLoadAmperage: number): number {
    const standardSizes = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const minSize = fullLoadAmperage * 1.25;
    return standardSizes.find(size => size >= minSize) || standardSizes[standardSizes.length - 1];
  }
}