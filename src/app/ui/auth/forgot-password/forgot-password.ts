import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!pass || !confirm) return null;
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly platformId = inject(PLATFORM_ID);

  loading = false;

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: [passwordsMatch] }
  );

  isInvalid(name: 'email' | 'password' | 'confirmPassword') {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;

    this.loading = true;
    const { email, password } = this.form.getRawValue();

    this.auth
      .forgotPassword({ email: email!, password: password! })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: 'Contraseña actualizada',
            detail: 'Ahora puedes iniciar sesión 👌',
          });
          this.router.navigateByUrl('/auth/login');
        },
        error: (err) => {
          if (err?.status === 404) {
            this.toast.add({
              severity: 'warn',
              summary: 'Correo no encontrado',
              detail: 'Verifica el correo o crea una cuenta.',
            });
            return;
          }
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la contraseña',
          });
        },
      });
  }
}
