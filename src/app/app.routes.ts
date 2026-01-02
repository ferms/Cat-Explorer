import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [
  // ─────────────────────────────────────────────
  // (AUTH)
  // ─────────────────────────────────────────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@ui/auth/login/login').then(m => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@ui/auth/register/register').then(m => m.Register),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('@ui/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PRIVADA (APP)
  // ─────────────────────────────────────────────
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cats' },
      {
        path: 'cats',
        loadComponent: () =>
          import('@ui/dashboard/cats-dashboard.page').then(
            m => m.CatsDashboardPage
          ),
      },
      {
        path: 'cats/:id',
        loadComponent: () =>
          import('@ui/dashboard/detail/cats-detail.page').then(
            m => m.CatDetailPage
          ),
      },
    ],
  },

  // ─────────────────────────────────────────────
  // FALLBACK
  // ─────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' },
];
