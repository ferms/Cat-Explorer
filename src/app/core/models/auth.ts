export interface LoginRequest { login: string; password: string; }
export interface AuthUser { id: number; email: string; name: string; }
export interface LoginResponse { token: string; user: AuthUser; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface ForgotPasswordRequest { email: string; password: string; }