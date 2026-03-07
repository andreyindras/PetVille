import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuncionariosService } from '../../../core/services/api.service';
import { Funcionario } from '../../../shared/models';

@Component({
  selector: 'app-func-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Funcionário' : 'Novo Funcionário' }}</h2>
    <mat-dialog-content>
      @if (error) { <div class="error-box">{{ error }}</div> }
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Nome completo</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
        @if (!data) {
          <mat-form-field appearance="outline">
            <mat-label>Senha</mat-label>
            <input matInput type="password" formControlName="senha" />
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="salvar()" [disabled]="loading">
        {{ loading ? 'Salvando...' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.error-box { background:#fee2e2; color:#991b1b; padding:8px 12px; border-radius:8px; font-size:.85rem; margin-bottom:12px; }`]
})
export class FuncDialogComponent {
  form: any;
  loading = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Funcionario | null,
    private ref: MatDialogRef<FuncDialogComponent>,
    private fb: FormBuilder,
    private svc: FuncionariosService
  ) {
    this.form = this.fb.group({
      nome: [data?.nome ?? '', Validators.required],
      email: [data?.email ?? '', [Validators.required, Validators.email]],
      senha: data ? [''] : ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  salvar() {
    this.loading = true; this.error = '';
    const v = this.form.value;
    const obs$ = this.data
      ? this.svc.atualizar(this.data.id, { nome: v.nome, email: v.email })
      : this.svc.criar({ nome: v.nome, email: v.email, senha: v.senha });
    obs$.subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro ao salvar.'; this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Funcionários</h1>
        <p>{{ funcionarios.length }} funcionários</p>
      </div>
      <div class="card-table">
        <div class="toolbar-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="filtrar()" placeholder="Nome ou e-mail..." />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="openDialog(null)">
            <mat-icon>add</mat-icon> Novo Funcionário
          </button>
        </div>
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:40px"><mat-spinner diameter="36"/></div>
        } @else {
          <table mat-table [dataSource]="filtered">
            <ng-container matColumnDef="nome"><th mat-header-cell *matHeaderCellDef>Nome</th><td mat-cell *matCellDef="let f">{{ f.nome }}</td></ng-container>
            <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>E-mail</th><td mat-cell *matCellDef="let f">{{ f.email }}</td></ng-container>
            <ng-container matColumnDef="cargo">
              <th mat-header-cell *matHeaderCellDef>Cargo</th>
              <td mat-cell *matCellDef="let f">
                <span [class]="f.cargo === 'ADMIN' ? 'badge-admin' : 'badge-func'">
                  {{ f.cargo === 'ADMIN' ? 'Admin' : 'Funcionário' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let f">
                @if (f.cargo !== 'ADMIN') {
                  <button mat-icon-button matTooltip="Promover a Admin" (click)="promover(f)">
                    <mat-icon style="color:#1d4ed8">trending_up</mat-icon>
                  </button>
                } @else {
                  <button mat-icon-button matTooltip="Rebaixar" (click)="rebaixar(f)">
                    <mat-icon style="color:#78716c">trending_down</mat-icon>
                  </button>
                }
                <button mat-icon-button (click)="openDialog(f)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deletar(f)"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (!filtered.length) {
            <div class="empty-state"><mat-icon>badge</mat-icon><p>Nenhum funcionário encontrado</p></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .badge-admin { background:#fdf4ee; color:#d4621e; padding:2px 10px; border-radius:999px; font-size:.75rem; font-weight:500; }
    .badge-func  { background:#f5f5f4; color:#57534e; padding:2px 10px; border-radius:999px; font-size:.75rem; font-weight:500; }
  `]
})
export class FuncionariosComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  filtered: Funcionario[] = [];
  loading = true;
  search = '';
  cols = ['nome', 'email', 'cargo', 'acoes'];

  constructor(private svc: FuncionariosService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.listar().subscribe(data => { this.funcionarios = data; this.filtrar(); this.loading = false; });
  }

  filtrar() {
    const q = this.search.toLowerCase();
    this.filtered = q ? this.funcionarios.filter(f =>
      f.nome.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    ) : [...this.funcionarios];
  }

  openDialog(f: Funcionario | null) {
    const ref = this.dialog.open(FuncDialogComponent, { width: '480px', data: f });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Salvo!', '', { duration: 2500 }); this.load(); } });
  }

  promover(f: Funcionario) {
    this.svc.promover(f.id).subscribe(() => { this.snack.open('Promovido a Admin!', '', { duration: 2500 }); this.load(); });
  }

  rebaixar(f: Funcionario) {
    this.svc.rebaixar(f.id).subscribe(() => { this.snack.open('Rebaixado a Funcionário!', '', { duration: 2500 }); this.load(); });
  }

  deletar(f: Funcionario) {
    if (!confirm(`Excluir funcionário ${f.nome}?`)) return;
    this.svc.deletar(f.id).subscribe(() => { this.snack.open('Excluído!', '', { duration: 2500 }); this.load(); });
  }
}