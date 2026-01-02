import { Injectable, Inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { map, tap } from 'rxjs';
import { environment } from '@core/environments/environments';
import {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@core/models/auth';

const TOKEN_KEY = 'cat_token';
const USER_KEY = 'cat_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;

  readonly user = signal<AuthUser | null>(null);
  readonly isLoggedIn = computed(() => !!this.token());

  readonly token = signal<string | null>(null);

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const user = this.readUser();
      const token = this.readToken();
      this.user.set(user);
      this.token.set(token);
    }
  }

  // ======================
  // helpers
  // ======================
  private url(path: string): string {
    return `${environment.api.base}${path}`;
  }

  // ======================
  // auth actions
  // ======================
  login(payload: LoginRequest) {
    return this.http
      .post<LoginResponse>(this.url(environment.api.auth.login), payload)
      .pipe(
        tap(({ token, user }) => this.setSession(token, user)),
        map(() => true)
      );
  }

  register(payload: RegisterRequest) {
    return this.http.post<{ ok: boolean }>(
      this.url(environment.api.auth.register),
      payload
    );
  }

  forgotPassword(payload: ForgotPasswordRequest) {
    return this.http.post<{ ok: boolean }>(
      this.url(environment.api.auth.forgotPassword),
      payload
    );
  }

  logout(): void {
    this.clearSession();
    this.user.set(null);
    this.token.set(null);
  }

  // ======================
  // session persistence
  // ======================
  private setSession(token: string, user: AuthUser): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.user.set(user);
    this.token.set(token);
  }

  private clearSession(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
