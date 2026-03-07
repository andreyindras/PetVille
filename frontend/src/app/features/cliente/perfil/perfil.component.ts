import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientesService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div style="max-width:520px">
      <div class="page-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:64px"><mat-spinner diameter="40"/></div>
      } @else {
        <mat-card style="border-radius:16px;border:1px solid #e7e5e4;box-shadow:0 1px 3px rgba(0,0,0,.06)">
          <mat-card-content style="padding:24px">
            <div class="user-header">
              <div class="avatar"><mat-icon>person</mat-icon></div>
              <div>
                <p class="user-name">{{ auth.user()?.nome }}</p>
                <p class="user-email">{{ auth.user()?.email }}</p>
              </div>
            </div>

            @if (error) { <div class="error-box">{{ error }}</div> }

            <form [formGroup]="form" class="form-grid" style="margin-top:20px">
              <mat-form-field appearance="outline" style="grid-column:1/-1">
                <mat-label>Nome completo</mat-label>
                <input matInput formControlName="nome" />
              </mat-form-field>
              <mat-form-field appearance="outline" style="grid-column:1/-1">
                <mat-label>E-mail</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>CPF</mat-label>
                <input matInput formControlName="cpf" readonly />
                <mat-hint>Não editável</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="telefone" />
              </mat-form-field>
              <mat-form-field appearance="outline" style="grid-column:1/-1">
                <mat-label>Endereço</mat-label>
                <input matInput formControlName="endereco" />
              </mat-form-field>
            </form>

            <div style="display:flex;justify-content:flex-end;margin-top:8px">
              <button mat-flat-button color="primary" (click)="salvar()" [disabled]="saving">
                {{ saving ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .user-header { display:flex; align-items:center; gap:16px; padding-bottom:20px; border-bottom:1px solid #f5f5f4; margin-bottom:4px; }
    .avatar { width:56px; height:56px; background:#fdf4ee; border-radius:16px; display:flex; align-items:center; justify-content:center;
      mat-icon { color:#d4621e; font-size:28px; width:28px; height:28px; } }
    .user-name { font-weight:600; font-size:1rem; color:#1c1917; margin:0; }
    .user-email { font-size:.85rem; color:#78716c; margin:0; }
    .error-box { background:#fee2e2; color:#991b1b; padding:10px 14px; border-radius:8px; font-size:.875rem; margin-bottom:12px; }
  `]
})
export class PerfilComponent implements OnInit {
  form: any;
  loading = true; saving = false; error = '';

  constructor(
    private fb: FormBuilder, private svc: ClientesService,
    public auth: AuthService, private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const cid = this.auth.user()?.clienteId;
    if (!cid) return;
    this.svc.buscar(cid).subscribe(c => {
      this.form = this.fb.group({
        nome: [c.nome], email: [c.email],
        cpf: [{ value: c.cpf, disabled: true }],
        telefone: [c.telefone ?? ''], endereco: [c.endereco ?? ''],
      });
      this.loading = false;
    });
  }

  salvar() {
    this.saving = true; this.error = '';
    const { telefone, endereco } = this.form.value;
    this.svc.atualizar(this.auth.user()!.clienteId!, { telefone, endereco }).subscribe({
      next: () => { this.saving = false; this.snack.open('Perfil atualizado!', '', { duration: 2500 }); },
      error: e => { this.error = e.error?.mensagem || 'Erro ao salvar.'; this.saving = false; }
    });
  }
}