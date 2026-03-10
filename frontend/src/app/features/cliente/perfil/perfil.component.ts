import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientesService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cliente } from '../../../shared/models';
import { CpfPipe, TelefonePipe, PhoneMaskDirective } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule,
    CpfPipe, TelefonePipe, PhoneMaskDirective
  ],
  template: `
    <div style="max-width:520px">
      <div class="page-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:64px"><mat-spinner diameter="40"/></div>
      } @else if (erroCarregar) {
        <div class="err-box">
          <mat-icon style="font-size:16px;width:16px;height:16px;flex-shrink:0">error_outline</mat-icon>
          {{ erroCarregar }}
        </div>
      } @else {
        <mat-card class="card">
          <mat-card-content>

            <div class="user-header">
              <div class="avatar"><span>{{ auth.user()?.nome?.charAt(0)?.toUpperCase() }}</span></div>
              <div>
                <p class="uname">{{ auth.user()?.nome }}</p>
                <p class="uemail">{{ auth.user()?.email }}</p>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <p class="info-lbl">CPF</p>
                <p class="info-val">{{ cliente?.cpf | cpf }}</p>
              </div>
              <div class="info-item">
                <p class="info-lbl">Telefone</p>
                <p class="info-val">{{ cliente?.telefone | telefone }}</p>
              </div>
              @if (cliente?.endereco) {
                <div class="info-item full">
                  <p class="info-lbl">Endereço</p>
                  <p class="info-val">{{ cliente?.endereco }}</p>
                </div>
              }
            </div>

            <div class="section-div"><span>Editar informações</span></div>

            @if (error) {
              <div class="err-box" style="margin-bottom:14px">
                <mat-icon style="font-size:16px;width:16px;height:16px;flex-shrink:0">error_outline</mat-icon>
                {{ error }}
              </div>
            }

            @if (form) {
              <form [formGroup]="form" class="edit-grid">
                <mat-form-field appearance="outline" class="full" subscriptSizing="dynamic">
                  <mat-label>Nome completo</mat-label>
                  <input matInput formControlName="nome" readonly/>
                  <mat-hint>Altere pelo suporte</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full" subscriptSizing="dynamic">
                  <mat-label>E-mail</mat-label>
                  <input matInput type="email" formControlName="email" readonly/>
                  <mat-hint>Altere pelo suporte</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Telefone</mat-label>
                  <input matInput formControlName="telefone" phoneMask
                         placeholder="(11) 99999-9999" inputmode="numeric"/>
                  <mat-icon matSuffix style="color:#a8a29e">phone</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full" subscriptSizing="dynamic">
                  <mat-label>Endereço</mat-label>
                  <input matInput formControlName="endereco"/>
                  <mat-icon matSuffix style="color:#a8a29e">home</mat-icon>
                </mat-form-field>
              </form>
            }

            <div class="actions">
              <button mat-flat-button color="primary" (click)="salvar()" [disabled]="saving">
                @if (saving) { Salvando... } @else {
                  <mat-icon>save</mat-icon> Salvar alterações
                }
              </button>
            </div>

          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .card { border-radius:16px!important;border:1px solid #e7e5e4!important;box-shadow:0 1px 4px rgba(0,0,0,.06)!important; }
    mat-card-content { padding:24px!important; }

    .user-header { display:flex;align-items:center;gap:14px;padding-bottom:18px;border-bottom:1px solid #f5f5f4;margin-bottom:18px; }
    .avatar { width:50px;height:50px;background:#d4621e;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 8px rgba(212,98,30,.25); span{font-size:1.2rem;font-weight:700;color:white;} }
    .uname  { font-weight:700;font-size:1rem;color:#1c1917;margin:0 0 2px; }
    .uemail { font-size:.82rem;color:#78716c;margin:0; }

    .info-grid  { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px; }
    .info-item  { background:#fafaf9;border-radius:9px;padding:10px 13px; }
    .info-item.full { grid-column:1/-1; }
    .info-lbl   { font-size:.67rem;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.05em;margin:0 0 3px; }
    .info-val   { font-size:.875rem;font-weight:500;color:#1c1917;margin:0; }

    .section-div {
      display:flex;align-items:center;gap:10px;margin-bottom:16px;
      span{font-size:.7rem;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;}
      &::before,&::after{content:'';flex:1;height:1px;background:#e7e5e4;}
    }

    .edit-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px; }
    .full { grid-column:1/-1; }

    .actions { display:flex;justify-content:flex-end; button{display:flex;align-items:center;gap:6px;} }
    .err-box { display:flex;align-items:flex-start;gap:8px;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;padding:10px 14px;border-radius:10px;font-size:.875rem; }
  `]
})
export class PerfilComponent implements OnInit {
  form: any;
  loading = true; saving = false; error = ''; erroCarregar = '';
  clienteId: number | null = null;
  cliente: Cliente | null = null;

  constructor(
    private fb: FormBuilder, private http: HttpClient,
    private svc: ClientesService, public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.http.get<Cliente>('/api/clientes/me').subscribe({
      next: c => {
        this.clienteId = c.id; this.cliente = c;
        this.form = this.fb.group({
          nome:     [{ value: c.nome,  disabled: true }],
          email:    [{ value: c.email, disabled: true }],
          telefone: [c.telefone ?? ''],
          endereco: [c.endereco ?? ''],
        });
        this.loading = false;
      },
      error: e => { this.erroCarregar = e.error?.mensagem || 'Erro ao carregar perfil.'; this.loading = false; }
    });
  }

  salvar() {
    if (!this.clienteId) return;
    this.saving = true; this.error = '';
    const raw = this.form.getRawValue();
    const telefone = raw.telefone?.replace(/\D/g, '') ?? '';
    this.svc.atualizar(this.clienteId, { telefone, endereco: raw.endereco }).subscribe({
      next: () => {
        if (this.cliente) this.cliente = { ...this.cliente, telefone, endereco: raw.endereco };
        this.saving = false;
        this.snack.open('Perfil atualizado!', '', { duration: 2500, verticalPosition: 'top' });
      },
      error: e => { this.error = e.error?.mensagem || 'Erro ao salvar.'; this.saving = false; }
    });
  }
}