import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { AuthService } from '@core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);

  loading = false;

  form = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(name: 'login' | 'password') {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { login, password } = this.form.getRawValue();

    this.auth.login({ login: login!, password: password! })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Inicio de sesión', detail: 'Bienvenido 👋' });
          this.router.navigateByUrl('/app/cats');
        },
        error: () => {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Credenciales inválidas' });
        },
      });
  }
}
