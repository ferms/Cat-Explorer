
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { UrlTree, Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let router: Router;
  let auth: { isLoggedIn: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      isLoggedIn: vi.fn(),
    };

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

  it('should allow access when user is logged in', () => {
    auth.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/app/cats' } as any)
    );

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /auth/login with redirect param when user is not logged in', () => {
    auth.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/app/cats' } as any)
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { redirect: '/app/cats' },
    });
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
      authGuard({} as any, { url: '/app/cats' } as any)
    );

    expect(result).toBe(true);
  });
});
