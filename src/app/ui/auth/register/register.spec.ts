import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { Register } from './register';
import { AuthService } from '@core/auth/auth.service';

describe('Register', () => {
  let auth: { register: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let toast: { add: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { register: vi.fn() };
    router = { navigateByUrl: vi.fn() };
    toast = { add: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },

  
        { provide: ActivatedRoute, useValue: { snapshot: {} } },

        { provide: MessageService, useValue: toast },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;

    comp.onSubmit();

    expect(auth.register).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should be invalid when passwords do not match', () => {
    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;

    comp.form.setValue({
      name: 'Fer',
      email: 'fer@test.com',
      password: '123456',
      confirmPassword: '654321',
    });

    expect(comp.form.valid).toBe(false);
    expect(comp.form.errors).toEqual({ passwordMismatch: true });
  });

  it('should register and navigate to login on success', () => {
    auth.register.mockReturnValue(of({ ok: true }));

    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;

    comp.form.setValue({
      name: 'Fernando',
      email: 'fer@test.com',
      password: '123456',
      confirmPassword: '123456',
    });

    comp.onSubmit();

    expect(auth.register).toHaveBeenCalledWith({
      name: 'Fernando',
      email: 'fer@test.com',
      password: '123456',
    });

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );

    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should show warn toast when email already exists (409)', () => {
    auth.register.mockReturnValue(
      throwError(() => ({ status: 409 }))
    );

    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;

    comp.form.setValue({
      name: 'Fernando',
      email: 'fer@test.com',
      password: '123456',
      confirmPassword: '123456',
    });

    comp.onSubmit();

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' })
    );

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should show error toast on other errors', () => {
    auth.register.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;

    comp.form.setValue({
      name: 'Fernando',
      email: 'fer@test.com',
      password: '123456',
      confirmPassword: '123456',
    });

    comp.onSubmit();

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' })
    );

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
