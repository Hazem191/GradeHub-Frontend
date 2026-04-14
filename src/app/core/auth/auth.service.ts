import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../shared/models/auth';

const AUTH_TOKEN_KEY = 'gradehub_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState = new BehaviorSubject<boolean>(this.hasToken());
  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/Auth/login`, request).pipe(
      tap((response) => this.saveToken(response.token))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/Auth/register`, request).pipe(
      tap((response) => this.saveToken(response.token))
    );
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return this.safeStorage() ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  }

  private saveToken(token: string): void {
    if (this.safeStorage()) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    this.authState.next(true);
  }

  private removeToken(): void {
    if (this.safeStorage()) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    this.authState.next(false);
  }

  private hasToken(): boolean {
    return this.safeStorage() && !!localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private safeStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
