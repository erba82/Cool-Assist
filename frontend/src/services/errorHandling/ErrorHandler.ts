export class ErrorHandler {
  private static readonly MAX_LOG_SIZE = 1000;
  private static errorLog: Array<{
    timestamp: Date;
    error: Error;
    context: string;
  }> = [];

  static handleError(error: Error, context: string): void {
    // افزودن خطا به لاگ
    this.logError(error, context);

    // خطاهای حساس را به سرور ارسال کنید
    if (this.isCriticalError(error)) {
      this.reportToServer(error, context);
    }

    // لاگ کردن در کنسول با فرمت مناسب
    console.error(`[${new Date().toISOString()}] ${context}: ${error.message}`, {
      error,
      stack: error.stack
    });
  }

  private static logError(error: Error, context: string): void {
    this.errorLog.push({
      timestamp: new Date(),
      error,
      context
    });

    // حفظ اندازه لاگ
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog.shift();
    }
  }

  private static isCriticalError(error: Error): boolean {
    return (
      error instanceof TypeError ||
      error.message.includes('network') ||
      error.message.includes('WebSocket') ||
      error.message.toLowerCase().includes('critical')
    );
  }

  private static async reportToServer(error: Error, context: string): Promise<void> {
    try {
      const errorReport = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context,
        environment: process.env.NODE_ENV,
        userAgent: navigator.userAgent
      };

      // ارسال به سرور برای لاگ کردن
      await fetch(`${process.env.REACT_APP_API_URL}/api/error-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportError) {
      // فقط در کنسول لاگ می‌کنیم تا از حلقه بازگشتی جلوگیری شود
      console.error('Failed to report error to server:', reportError);
    }
  }

  static getErrorLog(): Array<{
    timestamp: Date;
    error: Error;
    context: string;
  }> {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static async getErrorStats(): Promise<{
    total: number;
    critical: number;
    byType: Record<string, number>;
  }> {
    const stats = {
      total: this.errorLog.length,
      critical: 0,
      byType: {} as Record<string, number>
    };

    this.errorLog.forEach(({ error }) => {
      // شمارش خطاهای بحرانی
      if (this.isCriticalError(error)) {
        stats.critical++;
      }

      // شمارش بر اساس نوع خطا
      const errorType = error.name || 'Unknown';
      stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
    });

    return stats;
  }
}