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
import { ClientesService } from '../../../core/services/api.service';
import { Cliente } from '../../../shared/models';

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
    <mat-dialog-content>
      @if (error) { <div class="error-box">{{ error }}</div> }
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Nome completo</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
        @if (!data) {
          <mat-form-field appearance="outline">
            <mat-label>Senha</mat-label>
            <input matInput type="password" formControlName="senha" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>CPF (somente números)</mat-label>
            <input matInput formControlName="cpf" />
          </mat-form-field>
        }
        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="telefone" />
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Endereço</mat-label>
          <input matInput formControlName="endereco" />
        </mat-form-field>
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
export class ClienteDialogComponent {
  form: any;
  loading = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null,
    private ref: MatDialogRef<ClienteDialogComponent>,
    private fb: FormBuilder,
    private svc: ClientesService
  ) {
    this.form = this.fb.group({
      nome: [data?.nome ?? '', Validators.required],
      email: [data?.email ?? '', [Validators.required, Validators.email]],
      senha: data ? [''] : ['', [Validators.required, Validators.minLength(6)]],
      cpf: data ? [''] : ['', Validators.required],
      telefone: [data?.telefone ?? ''],
      endereco: [data?.endereco ?? ''],
    });
  }

  salvar() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const v = this.form.value;
    const obs$ = this.data
      ? this.svc.atualizar(this.data.id, { telefone: v.telefone, endereco: v.endereco })
      : this.svc.criar({ nome: v.nome, email: v.email, senha: v.senha, cpf: v.cpf, telefone: v.telefone, endereco: v.endereco });
    obs$.subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro ao salvar.'; this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Clientes</h1>
        <p>{{ clientes.length }} clientes cadastrados</p>
      </div>
      <div class="card-table">
        <div class="toolbar-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="filtrar()" placeholder="Nome, e-mail ou CPF..." />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="openDialog(null)">
            <mat-icon>add</mat-icon> Novo Cliente
          </button>
        </div>
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:40px"><mat-spinner diameter="36"/></div>
        } @else {
          <table mat-table [dataSource]="filtered">
            <ng-container matColumnDef="nome"><th mat-header-cell *matHeaderCellDef>Nome</th><td mat-cell *matCellDef="let c">{{ c.nome }}</td></ng-container>
            <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>E-mail</th><td mat-cell *matCellDef="let c">{{ c.email }}</td></ng-container>
            <ng-container matColumnDef="cpf"><th mat-header-cell *matHeaderCellDef>CPF</th><td mat-cell *matCellDef="let c">{{ c.cpf }}</td></ng-container>
            <ng-container matColumnDef="telefone"><th mat-header-cell *matHeaderCellDef>Telefone</th><td mat-cell *matCellDef="let c">{{ c.telefone || '—' }}</td></ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button (click)="openDialog(c)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deletar(c)"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (!filtered.length) {
            <div class="empty-state"><mat-icon>people</mat-icon><p>Nenhum cliente encontrado</p></div>
          }
        }
      </div>
    </div>
  `
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filtered: Cliente[] = [];
  loading = true;
  search = '';
  cols = ['nome', 'email', 'cpf', 'telefone', 'acoes'];

  constructor(private svc: ClientesService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.listar().subscribe(data => { this.clientes = data; this.filtrar(); this.loading = false; });
  }

  filtrar() {
    const q = this.search.toLowerCase();
    this.filtered = q ? this.clientes.filter(c =>
      c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.cpf?.includes(q)
    ) : [...this.clientes];
  }

  openDialog(c: Cliente | null) {
    const ref = this.dialog.open(ClienteDialogComponent, { width: '500px', data: c });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Cliente salvo!', '', { duration: 2500 }); this.load(); } });
  }

  deletar(c: Cliente) {
    if (!confirm(`Excluir cliente ${c.nome}?`)) return;
    this.svc.deletar(c.id).subscribe({ next: () => { this.snack.open('Cliente excluído!', '', { duration: 2500 }); this.load(); } });
  }
}