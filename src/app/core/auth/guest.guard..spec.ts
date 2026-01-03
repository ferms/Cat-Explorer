
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { guestGuard } from './guest.guard';
import { AuthService } from './auth.service';

describe('guestGuard', () => {
  let router: Router;
  let auth: { isLoggedIn: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { isLoggedIn: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }, 
        { provide: AuthService, useValue: auth },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(() => new UrlTree()),
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow access when user is NOT logged in', () => {
    auth.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /app when user IS logged in', () => {
    auth.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/app']);
  });

  it('should allow access on server (non-browser)', () => {

    TestBed.resetTestingModule();
    auth = { isLoggedIn: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: AuthService, useValue: auth },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn(() => new UrlTree()) },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });
});
