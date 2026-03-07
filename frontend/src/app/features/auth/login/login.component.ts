import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTabsModule
  ],
  template: `
    <div class="login-bg">
      <div class="login-card">
        <div class="login-logo">
          <div class="paw-circle">
            <mat-icon class="paw-icon">pets</mat-icon>
          </div>
          <h1>PetVille</h1>
          <p>Sistema de agendamentos pet</p>
        </div>

        <mat-tab-group [(selectedIndex)]="tabIndex" animationDuration="200ms" class="tabs">

          <!-- ===== ABA LOGIN ===== -->
          <mat-tab label="Entrar">
            <div class="tab-body">
              <form [formGroup]="loginForm" (ngSubmit)="submitLogin()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>E-mail</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="seu@email.com" />
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Senha</mat-label>
                  <input matInput [type]="showSenhaLogin ? 'text' : 'password'" formControlName="senha" />
                  <button mat-icon-button matSuffix type="button" (click)="showSenhaLogin = !showSenhaLogin">
                    <mat-icon>{{ showSenhaLogin ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>

                @if (loginError) {
                  <div class="error-box">
                    <mat-icon style="font-size:16px;width:16px;height:16px">error_outline</mat-icon>
                    {{ loginError }}
                  </div>
                }

                <button mat-flat-button color="primary" type="submit"
                  class="full-width submit-btn" [disabled]="loginLoading">
                  @if (loginLoading) {
                    <mat-spinner diameter="20" />
                  } @else {
                    <mat-icon>login</mat-icon> Entrar
                  }
                </button>
              </form>

              <p class="hint">Funcionário ou admin? Solicite acesso ao administrador.</p>
            </div>
          </mat-tab>

          <!-- ===== ABA CADASTRO ===== -->
          <mat-tab label="Criar conta">
            <div class="tab-body">
              <form [formGroup]="registerForm" (ngSubmit)="submitRegister()">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nome completo</mat-label>
                    <input matInput formControlName="nome" />
                    <mat-icon matSuffix>person</mat-icon>
                    @if (rf['nome'].touched && rf['nome'].errors?.['required']) {
                      <mat-error>Nome é obrigatório</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>E-mail</mat-label>
                  <input matInput type="email" formControlName="email" />
                  <mat-icon matSuffix>email</mat-icon>
                  @if (rf['email'].touched && rf['email'].errors?.['email']) {
                    <mat-error>E-mail inválido</mat-error>
                  }
                </mat-form-field>

                <div class="two-cols">
                  <mat-form-field appearance="outline">
                    <mat-label>Senha</mat-label>
                    <input matInput [type]="showSenhaReg ? 'text' : 'password'" formControlName="senha" />
                    <button mat-icon-button matSuffix type="button" (click)="showSenhaReg = !showSenhaReg">
                      <mat-icon>{{ showSenhaReg ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    @if (rf['senha'].touched && rf['senha'].errors?.['minlength']) {
                      <mat-error>Mínimo 6 caracteres</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>CPF (só números)</mat-label>
                    <input matInput formControlName="cpf" maxlength="11" placeholder="00000000000" />
                    @if (rf['cpf'].touched && rf['cpf'].errors?.['pattern']) {
                      <mat-error>11 dígitos numéricos</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="two-cols">
                  <mat-form-field appearance="outline">
                    <mat-label>Telefone (opcional)</mat-label>
                    <input matInput formControlName="telefone" maxlength="11" placeholder="11999999999" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Endereço (opcional)</mat-label>
                    <input matInput formControlName="endereco" />
                  </mat-form-field>
                </div>

                @if (registerError) {
                  <div class="error-box">
                    <mat-icon style="font-size:16px;width:16px;height:16px">error_outline</mat-icon>
                    {{ registerError }}
                  </div>
                }

                @if (registerSuccess) {
                  <div class="success-box">
                    <mat-icon style="font-size:16px;width:16px;height:16px">check_circle</mat-icon>
                    Conta criada! Fazendo login...
                  </div>
                }

                <button mat-flat-button color="primary" type="submit"
                  class="full-width submit-btn" [disabled]="registerLoading">
                  @if (registerLoading) {
                    <mat-spinner diameter="20" />
                  } @else {
                    <mat-icon>person_add</mat-icon> Criar conta
                  }
                </button>
              </form>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh;
      background: linear-gradient(135deg, #1c1917 0%, #292524 40%, #3b2a1f 100%);
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }

    .login-card {
      background: white; border-radius: 24px;
      width: 100%; max-width: 460px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.4);
      overflow: hidden;
    }

    .login-logo {
      text-align: center; padding: 36px 36px 8px;
      background: linear-gradient(160deg, #fdf4ee 0%, #fff 100%);
      border-bottom: 1px solid #f0ede9;
    }
    .paw-circle {
      width: 64px; height: 64px; background: #d4621e; border-radius: 20px;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 8px 20px rgba(212,98,30,0.35);
    }
    .paw-icon { font-size: 36px; width: 36px; height: 36px; color: white; }
    .login-logo h1 { font-size: 1.8rem; font-weight: 800; color: #1c1917; margin: 0 0 4px; letter-spacing: -0.5px; }
    .login-logo p { color: #a8a29e; font-size: 0.85rem; margin: 0 0 20px; }

    .tabs {
      ::ng-deep .mat-mdc-tab-header {
        background: #fafaf9;
        border-bottom: 1px solid #e7e5e4;
      }
      ::ng-deep .mat-mdc-tab { min-width: 50%; font-weight: 600; }
      ::ng-deep .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label { color: #d4621e; }
      ::ng-deep .mat-mdc-tab-indicator .mdc-tab-indicator__content--underline { border-color: #d4621e; }
    }

    .tab-body { padding: 24px 32px 32px; }

    .full-width { width: 100%; }

    .two-cols {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }

    .submit-btn {
      height: 48px; font-size: 1rem; font-weight: 600; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      border-radius: 12px !important;
      background: #d4621e !important; color: white !important;
      box-shadow: 0 4px 14px rgba(212,98,30,0.35) !important;
      transition: all .2s !important;
      &:hover:not(:disabled) {
        background: #b85319 !important;
        box-shadow: 0 6px 18px rgba(212,98,30,0.45) !important;
        transform: translateY(-1px);
      }
    }

    .error-box {
      display: flex; align-items: center; gap: 6px;
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 12px;
    }

    .success-box {
      display: flex; align-items: center; gap: 6px;
      background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;
      padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 12px;
    }

    .hint {
      text-align: center; font-size: 0.78rem; color: #a8a29e;
      margin-top: 16px; margin-bottom: 0; line-height: 1.5;
    }
  `]
})
export class LoginComponent {
  tabIndex = 0;
  showSenhaLogin = false;
  showSenhaReg = false;
  loginLoading = false;
  loginError = '';
  registerLoading = false;
  registerError = '';
  registerSuccess = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  registerForm = this.fb.group({
    nome:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    senha:    ['', [Validators.required, Validators.minLength(6)]],
    cpf:      ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    telefone: [''],
    endereco: [''],
  });

  get rf(): { [key: string]: AbstractControl } { return this.registerForm.controls; }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  submitLogin() {
    if (this.loginForm.invalid) return;
    this.loginLoading = true;
    this.loginError = '';
    const { email, senha } = this.loginForm.value;
    this.auth.login({ email: email!, senha: senha! }).subscribe({
      next: res => {
        if (res.tipoUsuario === 'CLIENTE') this.router.navigate(['/cliente/agendamentos']);
        else this.router.navigate(['/admin/dashboard']);
      },
      error: err => {
        this.loginError = err.status === 401 ? 'E-mail ou senha incorretos.' : 'Erro ao conectar ao servidor.';
        this.loginLoading = false;
      }
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.registerLoading = true;
    this.registerError = '';
    const v = this.registerForm.value;

    this.http.post<any>('/api/clientes', {
      nome: v.nome,
      email: v.email,
      senha: v.senha,
      cpf: v.cpf,
      telefone: v.telefone || undefined,
      endereco: v.endereco || undefined,
    }).subscribe({
      next: (cliente) => {
        this.registerSuccess = true;
        this.auth.login({ email: v.email!, senha: v.senha! }).subscribe({
          next: () => this.router.navigate(['/cliente/agendamentos']),
          error: () => {
            this.registerLoading = false;
            this.registerSuccess = false;
            this.tabIndex = 0;
            this.loginForm.patchValue({ email: v.email! });
          }
        });
      },
      error: e => {
        this.registerError = e.error?.mensagem || 'Erro ao criar conta. Verifique os dados.';
        this.registerLoading = false;
      }
    });
  }
}