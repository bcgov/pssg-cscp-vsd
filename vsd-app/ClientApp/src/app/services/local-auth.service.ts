import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService as AuthApiService } from '../../api/auth/auth.service';
import { LoginRequest } from '../../model';

const TOKEN_KEY = 'vsd_auth_token';
const USERNAME_KEY = 'vsd_auth_username';

export interface LoginResult {
  success: boolean;
  token?: string;
  username?: string;
  error?: string;
}

/**
 * Thin wrapper around the generated AuthService that manages
 * token storage and exposes an isLoggedIn check.
 * Temporary — will be replaced by Keycloak integration.
 */
@Injectable({ providedIn: 'root' })
export class LocalAuthService {
  constructor(private authApi: AuthApiService, private router: Router) {}

  /** Attempt login, store token on success. */
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const request: LoginRequest = { username, password };
      const response = await firstValueFrom(this.authApi.postApiAuthLogin<LoginResult>(request));
      if (response?.token) {
        sessionStorage.setItem(TOKEN_KEY, response.token);
        sessionStorage.setItem(USERNAME_KEY, response.username ?? username);
        return response;
      }
      return { success: false, error: 'No token received.' };
    } catch (err: any) {
      const message = err?.error?.error ?? err?.message ?? 'Login failed.';
      return { success: false, error: message };
    }
  }

  /** Returns the stored JWT or null. */
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  /** Returns the logged-in username or null. */
  getUsername(): string | null {
    return sessionStorage.getItem(USERNAME_KEY);
  }

  /** True when a token exists in session storage. */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Clear credentials and redirect to login. */
  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    this.router.navigate(['']);
  }
}
