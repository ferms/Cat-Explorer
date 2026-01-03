import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '@core/auth/auth.service';

describe('Login', () => {
  let auth: { login: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let toast: { add: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = {
      login: vi.fn(),
    };

    router = {
      navigateByUrl: vi.fn(),
    };

    toast = {
      add: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login], // standalone
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },

        { provide: MessageService, useValue: toast },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Login);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(Login);
    const comp = fixture.componentInstance;

    comp.onSubmit();

    expect(auth.login).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should login and navigate on success', () => {
    auth.login.mockReturnValue(of(true));

    const fixture = TestBed.createComponent(Login);
    const comp = fixture.componentInstance;

    comp.form.setValue({
      login: 'admin',
      password: '123456',
    });

    comp.onSubmit();

    expect(auth.login).toHaveBeenCalledWith({
      login: 'admin',
      password: '123456',
    });

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
      })
    );

    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/cats');
  });

  it('should show error toast on login error', () => {
    auth.login.mockReturnValue(throwError(() => new Error('Invalid')));

    const fixture = TestBed.createComponent(Login);
    const comp = fixture.componentInstance;

    comp.form.setValue({
      login: 'admin',
      password: '123456',
    });

    comp.onSubmit();

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
      })
    );

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
