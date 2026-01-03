// src/app/core/auth/auth.service.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { environment } from '@core/environments/environments';
import { AuthUser } from '@core/models/auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: AuthUser = {
    id: 1,
    name: 'Admin',
    email: 'admin@demo.com',
  };

  const mockToken = 'fake-jwt-token';

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login and set session correctly', () => {
    service
      .login({ login: 'admin@demo.com', password: '123456' })
      .subscribe(result => {
        expect(result).toBe(true);
      });

    const req = httpMock.expectOne(
      `${environment.api.base}${environment.api.auth.login}`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      login: 'admin@demo.com',
      password: '123456',
    });

    req.flush({
      token: mockToken,
      user: mockUser,
    });

    expect(service.user()).toEqual(mockUser);
    expect(service.token()).toBe(mockToken);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should logout and clear session', () => {
    localStorage.setItem('cat_token', mockToken);
    localStorage.setItem('cat_user', JSON.stringify(mockUser));

    service.logout();

    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

it('should initialize from localStorage in browser', () => {
  localStorage.setItem('cat_token', mockToken);
  localStorage.setItem('cat_user', JSON.stringify(mockUser));

  TestBed.resetTestingModule(); 

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: 'browser' },
    ],
  });

  service = TestBed.inject(AuthService);

  expect(service.token()).toBe(mockToken);
  expect(service.user()).toEqual(mockUser);
  expect(service.isLoggedIn()).toBe(true);
});

});
