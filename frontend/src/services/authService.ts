// F:\Cool-Assist\frontend\src\services\authService.ts

import { apiService } from './api/index';
import { SecurityService } from './security/SecurityService';
import { ErrorHandler } from './errorHandling/ErrorHandler';

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  linkedInAccessToken?: string;
  linkedInProfile?: any;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_tokens';
  private static readonly USER_KEY = 'user_data';
  private static readonly LINKEDIN_STATE_KEY = 'linkedin_auth_state';
  private static readonly GOOGLE_STATE_KEY = 'google_auth_state';
  private static tokenRefreshTimeout: NodeJS.Timeout | null = null;

  static async signUpWithEmail(data: { 
    email: string; 
    password: string; 
    fullName: string; 
  }): Promise<User> {
    try {
      // استفاده از جنریک برای مشخص کردن تایپ خروجی
      const response = await apiService.post<{ user: User; tokens: AuthToken }>('/auth/signup', data);
      const { user, tokens } = response.data;

      await this.setTokens(tokens);
      await this.setUser(user);
      this.setupTokenRefresh(tokens.expiresIn);

      return user;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.signUpWithEmail');
      throw error;
    }
  }

  static async signUpWithLinkedIn(): Promise<void> {
    try {
      const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
      const scope = 'r_emailaddress r_liteprofile r_basicprofile';
      const state = SecurityService.generateSecureToken(32);
      
      // ذخیره state جهت محافظت CSRF
      localStorage.setItem(this.LINKEDIN_STATE_KEY, state);

      // ساخت URL احراز هویت LinkedIn
      const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      linkedInAuthUrl.searchParams.append('response_type', 'code');
      linkedInAuthUrl.searchParams.append('client_id', clientId!);
      linkedInAuthUrl.searchParams.append('redirect_uri', redirectUri);
      linkedInAuthUrl.searchParams.append('scope', scope);
      linkedInAuthUrl.searchParams.append('state', state);

      // هدایت به LinkedIn
      window.location.href = linkedInAuthUrl.toString();
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.signUpWithLinkedIn');
      throw error;
    }
  }

  static async googleSignUp(): Promise<void> {
    try {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'openid email profile';
      const state = SecurityService.generateSecureToken(32);

      // ذخیره state جهت محافظت CSRF
      localStorage.setItem(this.GOOGLE_STATE_KEY, state);

      // ساخت URL احراز هویت گوگل
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.append('response_type', 'code');
      googleAuthUrl.searchParams.append('client_id', clientId!);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
      googleAuthUrl.searchParams.append('scope', scope);
      googleAuthUrl.searchParams.append('state', state);

      // هدایت به گوگل
      window.location.href = googleAuthUrl.toString();
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.googleSignUp');
      throw error;
    }
  }

  static async handleLinkedInCallback(code: string, state: string): Promise<User> {
    try {
      // بررسی state برای جلوگیری از حملات CSRF
      const savedState = localStorage.getItem(this.LINKEDIN_STATE_KEY);
      if (!savedState || state !== savedState) {
        throw new Error('Invalid state parameter');
      }

      // مبادله کد برای دریافت توکن‌ها
      const response = await apiService.post<{ user: User; tokens: AuthToken }>('/auth/linkedin/callback', {
        code,
        state,
        redirectUri: `${window.location.origin}/auth/linkedin/callback`
      });

      const { user, tokens } = response.data;

      // ذخیره اطلاعات احراز هویت
      await this.setTokens(tokens);
      await this.setUser(user);
      this.setupTokenRefresh(tokens.expiresIn);

      return user;
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.handleLinkedInCallback');
      throw error;
    } finally {
      localStorage.removeItem(this.LINKEDIN_STATE_KEY);
    }
  }

  static async updateUserProfile(userId: string): Promise<void> {
    try {
      // استفاده از جنریک برای مشخص کردن تایپ خروجی
      const response = await apiService.get<{ user: User }>(`/users/${userId}/linkedin-profile`);
      const user = response.data.user;
      await this.setUser(user);
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.updateUserProfile');
      throw error;
    }
  }

  private static async setTokens(tokens: AuthToken): Promise<void> {
    try {
      const encryptedTokens = await SecurityService.encryptData(tokens, 'auth-secret-key');
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(encryptedTokens));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.setTokens');
      throw error;
    }
  }

  private static async setUser(user: User): Promise<void> {
    try {
      const encryptedUser = await SecurityService.encryptData(user, 'user-secret-key');
      localStorage.setItem(this.USER_KEY, JSON.stringify(encryptedUser));
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.setUser');
      throw error;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const encryptedUser = localStorage.getItem(this.USER_KEY);
      if (!encryptedUser) return null;

      return await SecurityService.decryptData(
        JSON.parse(encryptedUser),
        'user-secret-key'
      );
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.getUser');
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      const tokens = await this.getTokens();
      if (tokens?.refreshToken) {
        await apiService.post('/auth/logout', { refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.logout');
    } finally {
      this.clearAuth();
    }
  }

  private static async getTokens(): Promise<AuthToken | null> {
    try {
      const encryptedTokens = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedTokens) return null;

      return await SecurityService.decryptData(
        JSON.parse(encryptedTokens),
        'auth-secret-key'
      );
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.getTokens');
      return null;
    }
  }

  private static setupTokenRefresh(expiresIn: number): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // تمدید توکن 5 دقیقه قبل از انقضا
    const refreshTime = (expiresIn - 300) * 1000;
    this.tokenRefreshTimeout = setTimeout(() => {
      this.refreshTokens().catch(console.error);
    }, refreshTime);
  }

  private static async refreshTokens(): Promise<void> {
    try {
      const tokens = await this.getTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<{ tokens: AuthToken }>('/auth/refresh', {
        refreshToken: tokens.refreshToken
      });

      await this.setTokens(response.data.tokens);
      this.setupTokenRefresh(response.data.tokens.expiresIn);
    } catch (error) {
      ErrorHandler.handleError(error as Error, 'AuthService.refreshTokens');
      this.clearAuth();
      throw error;
    }
  }

  private static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return !!tokens?.accessToken;
  }
}
