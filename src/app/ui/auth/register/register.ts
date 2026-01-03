import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly auth = inject(AuthService);

  loading = false;

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: [passwordsMatch] }
  );

  isInvalid(name: 'name' | 'email' | 'password' | 'confirmPassword') {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { name, email, password } = this.form.getRawValue();

    this.auth
      .register({ name: name!, email: email!, password: password! })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: 'Cuenta creada',
            detail: 'Ahora inicia sesión ✨',
          });
          this.router.navigateByUrl('/auth/login');
        },
        error: (err) => {
          if (err?.status === 409) {
            this.toast.add({
              severity: 'warn',
              summary: 'Correo ya registrado',
              detail: 'Intenta iniciar sesión o usa otro correo.',
            });
            return;
          }
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la cuenta',
          });
        },
      });
  }
}
