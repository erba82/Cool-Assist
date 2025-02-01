// src/services/security/SecurityService.ts
import { AES, enc } from 'crypto-js';
import { RateLimiter } from 'limiter';

export class SecurityService {
  private static readonly limiter = new RateLimiter({
    tokensPerInterval: 100,
    interval: 'minute'
  });

  // Data encryption
  static encryptData(data: any, secretKey: string): string {
    return AES.encrypt(JSON.stringify(data), secretKey).toString();
  }

  // Data decryption
  static decryptData(encryptedData: string, secretKey: string): any {
    const bytes = AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(enc.Utf8));
  }

  // Request rate limiting
  static async checkRateLimit(userId: string): Promise<boolean> {
    try {
      await this.limiter.removeTokens(1);
      return true;
    } catch {
      throw new Error('Rate limit exceeded');
    }
  }

  // XSS Protection
  static sanitizeInput(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  // SQL Injection Protection
  static escapeSQLInput(input: string): string {
    return input.replace(/['";\\]/g, '\\$&');
  }
}