import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ServicosService } from '../../../core/services/api.service';
import { Servico, TipoServico } from '../../../shared/models';

const TIPOS: TipoServico[] = ['BANHO','TOSA','BANHO_TOSA','HIGIENE_COMPLETA','CORTE_UNHAS',
  'LIMPEZA_OUVIDOS','ESCOVACAO_DENTES','BANHO_MEDICINAL','CONSULTA','VACINA','MEDICACAO','OUTROS'];

@Component({
  selector: 'app-servico-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
    <mat-dialog-content>
      @if (error) { <div class="error-box">{{ error }}</div> }
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            @for (t of tipos; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Duração (min)</mat-label>
          <input matInput type="number" formControlName="duracaoMinutos" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Preço (R$)</mat-label>
          <input matInput type="number" step="0.01" formControlName="preco" />
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="descricao" rows="3"></textarea>
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
export class ServicoDialogComponent {
  form: any;
  loading = false;
  error = '';
  tipos = TIPOS;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Servico | null,
    private ref: MatDialogRef<ServicoDialogComponent>,
    private fb: FormBuilder,
    private svc: ServicosService
  ) {
    this.form = this.fb.group({
      nome: [data?.nome ?? '', Validators.required],
      tipo: [data?.tipo ?? 'BANHO', Validators.required],
      descricao: [data?.descricao ?? ''],
      preco: [data?.preco ?? '', Validators.required],
      duracaoMinutos: [data?.duracaoMinutos ?? '', Validators.required],
    });
  }

  salvar() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const v = this.form.value;
    const obs$ = this.data
      ? this.svc.atualizar(this.data.id, v)
      : this.svc.criar(v);
    obs$.subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro ao salvar.'; this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatSlideToggleModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Serviços</h1>
        <p>{{ servicos.length }} serviços cadastrados</p>
      </div>
      <div class="card-table">
        <div class="toolbar-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="filtrar()" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="openDialog(null)">
            <mat-icon>add</mat-icon> Novo Serviço
          </button>
        </div>
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:40px"><mat-spinner diameter="36"/></div>
        } @else {
          <table mat-table [dataSource]="filtered">
            <ng-container matColumnDef="nome"><th mat-header-cell *matHeaderCellDef>Nome</th><td mat-cell *matCellDef="let s">{{ s.nome }}</td></ng-container>
            <ng-container matColumnDef="tipo"><th mat-header-cell *matHeaderCellDef>Tipo</th><td mat-cell *matCellDef="let s">{{ s.tipo }}</td></ng-container>
            <ng-container matColumnDef="duracao"><th mat-header-cell *matHeaderCellDef>Duração</th><td mat-cell *matCellDef="let s">{{ s.duracaoMinutos }} min</td></ng-container>
            <ng-container matColumnDef="preco"><th mat-header-cell *matHeaderCellDef>Preço</th><td mat-cell *matCellDef="let s">R$ {{ s.preco | number:'1.2-2' }}</td></ng-container>
            <ng-container matColumnDef="ativo">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let s">
                <span [class]="s.ativo ? 'badge-ativo' : 'badge-inativo'">{{ s.ativo ? 'Ativo' : 'Inativo' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button (click)="openDialog(s)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deletar(s)"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (!filtered.length) {
            <div class="empty-state"><mat-icon>content_cut</mat-icon><p>Nenhum serviço encontrado</p></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .badge-ativo   { background:#dcfce7; color:#166534; padding:2px 10px; border-radius:999px; font-size:.75rem; font-weight:500; }
    .badge-inativo { background:#f5f5f4; color:#78716c; padding:2px 10px; border-radius:999px; font-size:.75rem; font-weight:500; }
  `]
})
export class ServicosComponent implements OnInit {
  servicos: Servico[] = [];
  filtered: Servico[] = [];
  loading = true;
  search = '';
  cols = ['nome', 'tipo', 'duracao', 'preco', 'ativo', 'acoes'];

  constructor(private svc: ServicosService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.listar().subscribe(data => { this.servicos = data; this.filtrar(); this.loading = false; });
  }

  filtrar() {
    const q = this.search.toLowerCase();
    this.filtered = q ? this.servicos.filter(s => s.nome.toLowerCase().includes(q)) : [...this.servicos];
  }

  openDialog(s: Servico | null) {
    const ref = this.dialog.open(ServicoDialogComponent, { width: '520px', data: s });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Serviço salvo!', '', { duration: 2500 }); this.load(); } });
  }

  deletar(s: Servico) {
    if (!confirm(`Excluir serviço ${s.nome}?`)) return;
    this.svc.deletar(s.id).subscribe(() => { this.snack.open('Excluído!', '', { duration: 2500 }); this.load(); });
  }
}