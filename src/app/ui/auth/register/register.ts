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
              <h1 class="text-[#FFD642] text-4xl font-extrabold leading-tight">Crea tu cuenta</h1>
              <p class="mt-4 text-white/80 max-w-md leading-relaxed">
                Guarda favoritos, explora razas y arma tu colección.
              </p>
            </div>

            <div class="mt-10 flex justify-center lg:justify-start">
              <img
                src="/assets/img/cat.png"
                alt="Gato ilustración"
                class="w-[320px] xl:w-[420px] max-w-full drop-shadow-2xl select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>
        </aside>

        <main class="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-14 lg:py-0">
          <div class="w-full max-w-md">
            <h1 class="text-4xl font-extrabold tracking-tight">Registro</h1>

            <p class="mt-4 text-gray-600">
              ¿Ya tienes cuenta?
              <a routerLink="/auth/login" class="text-blue-600 hover:underline font-semibold">Inicia sesión</a>
            </p>

            <form class="mt-10 space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()">

              <div class="space-y-2">
                <input
                  pInputText
                  formControlName="name"
                  placeholder="Nombre*"
                  class="w-full h-12 rounded-xl border border-[#606D78] px-4 text-base"
                />
                @if (isInvalid('name')) {
                  <small class="text-red-600 font-semibold">Nombre requerido (mínimo 2)</small>
                }
              </div>

              <div class="space-y-2">
                <input
                  pInputText
                  type="email"
                  formControlName="email"
                  placeholder="Correo*"
                  class="w-full h-12 rounded-xl border border-[#606D78] px-4 text-base"
                />
                @if (isInvalid('email')) {
                  <small class="text-red-600 font-semibold">Correo válido requerido</small>
                }
              </div>

              <div class="space-y-2">
                <p-password
                  formControlName="password"
                  [toggleMask]="true"
                  [feedback]="true"
                  placeholder="Contraseña*"
                  class="w-full"
                  inputStyleClass="w-full h-12 rounded-xl border border-[#606D78] px-4 text-base"
                />
                @if (isInvalid('password')) {
                  <small class="text-red-600 font-semibold">Mínimo 6 caracteres</small>
                }
              </div>

              <div class="space-y-2">
                <p-password
                  formControlName="confirmPassword"
                  [toggleMask]="true"
                  [feedback]="false"
                  placeholder="Confirmar contraseña*"
                  class="w-full"
                  inputStyleClass="w-full h-12 rounded-xl border border-[#606D78] px-4 text-base"
                />

                @if (form.errors?.['passwordMismatch'] && (form.touched || form.dirty)) {
                  <small class="text-red-600 font-semibold">Las contraseñas no coinciden</small>
                }
              </div>

              <p-button
                type="submit"
                label="Crear cuenta"
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
