import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
}

class TokenService {
  private static REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  static needsRefresh(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp - currentTime < this.REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  }
}

export default TokenService;