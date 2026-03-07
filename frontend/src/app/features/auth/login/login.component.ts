import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-bg">
      <div class="login-card">
        <div class="login-logo">
          <mat-icon class="paw-icon">pets</mat-icon>
          <h1>PetVille</h1>
          <p>Bem-vindo de volta</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" placeholder="seu@email.com" />
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input matInput [type]="showSenha ? 'text' : 'password'" formControlName="senha" />
            <button mat-icon-button matSuffix type="button" (click)="showSenha = !showSenha">
              <mat-icon>{{ showSenha ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (error) {
            <div class="error-box">{{ error }}</div>
          }

          <button mat-flat-button color="primary" type="submit"
            class="full-width submit-btn" [disabled]="loading">
            @if (loading) {
              <mat-spinner diameter="20" />
            } @else {
              Entrar
            }
          </button>
        </form>

        <p class="hint">Não tem conta? Fale com um administrador.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh;
      background: linear-gradient(135deg, #fdf4ee 0%, #fae3cc 50%, #f5c49a 100%);
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .login-card {
      background: white; border-radius: 20px; padding: 40px 36px;
      width: 100%; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    }
    .login-logo {
      text-align: center; margin-bottom: 32px;
      .paw-icon { font-size: 48px; width: 48px; height: 48px; color: #d4621e; }
      h1 { font-size: 1.75rem; font-weight: 700; color: #1c1917; margin: 8px 0 4px; }
      p { color: #78716c; font-size: 0.9rem; margin: 0; }
    }
    .full-width { width: 100%; }
    .submit-btn { height: 44px; font-size: 1rem; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px; }
    .error-box {
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      padding: 10px 14px; border-radius: 8px; font-size: 0.875rem; margin-bottom: 12px;
    }
    .hint { text-align: center; font-size: 0.8rem; color: #a8a29e; margin-top: 20px; }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });
  showSenha = false;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { email, senha } = this.form.value;
    this.auth.login({ email: email!, senha: senha! }).subscribe({
      next: res => {
        if (res.tipoUsuario === 'CLIENTE') this.router.navigate(['/cliente/agendamentos']);
        else this.router.navigate(['/admin/dashboard']);
      },
      error: err => {
        this.error = err.status === 401 ? 'E-mail ou senha incorretos.' : 'Erro ao conectar.';
        this.loading = false;
      }
    });
  }
}