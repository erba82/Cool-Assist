export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export class SecurityService {
  /**
   * Generates a secure random token of the given length using the Web Crypto API.
   * @param length The desired length of the token.
   * @returns A secure random token as a string.
   */
  public static generateSecureToken(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    // Create a Uint32Array with the desired length
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      token += charset[values[i] % charset.length];
    }
    return token;
  }

  /**
   * Simulated asynchronous encryption function.
   * @param data Data to be encrypted.
   * @param key Encryption key.
   * @returns A promise that resolves to the encrypted data.
   */
  static async encryptData(data: any, key: string): Promise<EncryptedData> {
    const jsonData = JSON.stringify(data);
    return new Promise<EncryptedData>((resolve) => {
      setTimeout(() => {
        resolve({
          data: btoa(jsonData),
          iv: 'dummyIV',
          salt: 'dummySalt'
        });
      }, 100);
    });
  }

  /**
   * Simulated asynchronous decryption function.
   * @param encrypted The encrypted data.
   * @param key Decryption key.
   * @returns A promise that resolves to the decrypted data.
   */
  static async decryptData(encrypted: EncryptedData, key: string): Promise<any> {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const jsonData = atob(encrypted.data);
        resolve(JSON.parse(jsonData));
      }, 100);
    });
  }
}