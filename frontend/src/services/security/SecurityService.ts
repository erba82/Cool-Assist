import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export class SecurityService {
  private static readonly KEY_SIZE = 256;
  private static readonly ITERATION_COUNT = 100000;

  static async encryptData(data: any, key: string): Promise<EncryptedData> {
    try {
      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);

      // Generate key using PBKDF2
      const derivedKey = CryptoJS.PBKDF2(key, salt, {
        keySize: this.KEY_SIZE / 32,
        iterations: this.ITERATION_COUNT
      });

      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        data: encrypted.toString(),
        iv: iv.toString(),
        salt: salt.toString()
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static async decryptData(encryptedData: EncryptedData, key: string): Promise<any> {
    try {
      // Recreate key using PBKDF2
      const derivedKey = CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(encryptedData.salt), {
        keySize: this.KEY_SIZE / 32,
        iterations: this.ITERATION_COUNT
      });

      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const hash = CryptoJS.PBKDF2(password, salt, {
          keySize: this.KEY_SIZE / 32,
          iterations: this.ITERATION_COUNT
        });

        resolve(`${salt.toString()}:${hash.toString()}`);
      } catch (error) {
        reject(error);
      }
    });
  }

  static verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const [salt, originalHash] = hashedPassword.split(':');
        const hash = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
          keySize: this.KEY_SIZE / 32,
          iterations: this.ITERATION_COUNT
        });

        resolve(hash.toString() === originalHash);
      } catch (error) {
        reject(error);
      }
    });
  }

  static generateSecureToken(length: number = 32): string {
    return Buffer.from(CryptoJS.lib.WordArray.random(length).toString())
      .toString('base64')
      .replace(/[+/=]/g, '')
      .substr(0, length);
  }
}