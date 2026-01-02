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
  template: `
    <div class="min-h-screen w-full bg-[#0b1020]">
      <div class="min-h-screen flex flex-col lg:flex-row">

        <aside class="hidden lg:flex lg:w-1/2 bg-[#0B42FF] text-white relative overflow-hidden">
          <div class="w-full flex flex-col justify-between p-12 xl:p-16">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-2xl bg-white/15 grid place-items-center">
                <i class="pi pi-sparkles text-white"></i>
              </div>
              <div class="text-2xl font-extrabold tracking-tight">Cat Breeds Explorer</div>
            </div>

            <div class="mt-10">
              <h1 class="text-[#FFD642] text-4xl font-extrabold leading-tight">Bienvenido de nuevo</h1>
              <p class="mt-4 text-white/80 max-w-md leading-relaxed">
                Explora razas, imágenes y detalles. Inicia sesión para continuar.
              </p>
            </div>

            <div class="relative mt-10">
              <div class="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-white/10 blur-2xl"></div>
              <div class="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#FFD642]/20 blur-2xl"></div>

            <div class="mt-10 flex justify-center lg:justify-start">
              <img
                src="../../../../assets/img/cat2.png"
                alt="Gato ilustración"
                class="w-[320px] xl:w-[420px] max-w-full drop-shadow-2xl select-none pointer-events-none"
                loading="lazy"
              />
            </div>

            </div>
          </div>
        </aside>

        <main class="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-14 lg:py-0">
          <div class="w-full max-w-md">
            <h1 class="text-4xl font-extrabold tracking-tight">Iniciar sesión</h1>

            <p class="mt-4 text-gray-600">
              ¿No tienes cuenta?
              <a routerLink="/auth/register" class="text-blue-600 hover:underline font-semibold">Regístrate</a>
            </p>

            <form class="mt-10 space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()">

              <div class="space-y-2">
                <input
                  pInputText
                  formControlName="login"
                  placeholder="Correo o usuario*"
                  class="w-full h-12 rounded-xl border border-[#606D78] px-4 text-base"
                />

                @if (isInvalid('login')) {
                  <small class="text-red-600 font-semibold">
                    Ingresa un correo/usuario válido
                  </small>
                }
              </div>

              <div class="space-y-2">
                <p-password
                  formControlName="password"
                  [feedback]="false"
                  [toggleMask]="true"
                  placeholder="Contraseña*"
                  class="w-full"
                  inputStyleClass="w-full h-12 rounded-xl border border-[#606D78] px-4 text-base"
                />

                @if (isInvalid('password')) {
                  <small class="text-red-600 font-semibold">
                    Contraseña requerida (mínimo 6)
                  </small>
                }
              </div>

              <div class="text-left">
                <a class="text-blue-600 hover:underline font-semibold" routerLink="/auth/forgot-password">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <p-button
                type="submit"
                label="Continuar"
                icon="pi pi-arrow-right"
                iconPos="right"
                class="w-full h-12 rounded-full font-semibold"
                [disabled]="form.invalid || loading"
              ></p-button>
            </form>
          </div>
        </main>

      </div>
    </div>
  `,
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
          this.router.navigateByUrl('/');
        },
        error: () => {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Credenciales inválidas' });
        },
      });
  }
}
