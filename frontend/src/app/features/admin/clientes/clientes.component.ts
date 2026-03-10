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
import { ClientesService } from '../../../core/services/api.service';
import { Cliente } from '../../../shared/models';
import { CpfPipe, TelefonePipe, CpfMaskDirective, PhoneMaskDirective } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDialogModule, MatIconModule, CpfMaskDirective, PhoneMaskDirective],
  template: `
    <div class="dlg-header">
      <div class="dlg-ico"><mat-icon>{{ data ? 'edit' : 'person_add' }}</mat-icon></div>
      <div>
        <h2 mat-dialog-title>{{ data ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
        @if (data) { <p class="dlg-sub">{{ data.nome }}</p> }
      </div>
    </div>

    <mat-dialog-content>
      @if (error) {
        <div class="err-box">
          <mat-icon style="font-size:15px;width:15px;height:15px;flex-shrink:0">error_outline</mat-icon>
          {{ error }}
        </div>
      }
      <form [formGroup]="form" class="fg">
        <mat-form-field appearance="outline" style="grid-column:1/-1" subscriptSizing="dynamic">
          <mat-label>Nome completo</mat-label>
          <input matInput formControlName="nome"/>
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1" subscriptSizing="dynamic">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" formControlName="email" inputmode="email"/>
        </mat-form-field>
        @if (!data) {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Senha</mat-label>
            <input matInput type="password" formControlName="senha"/>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>CPF</mat-label>
            <input matInput formControlName="cpf" cpfMask
                   placeholder="000.000.000-00" inputmode="numeric"/>
            @if (form.get('cpf')?.touched && form.get('cpf')?.errors?.['pattern']) {
              <mat-error>Digite os 11 dígitos</mat-error>
            }
          </mat-form-field>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="telefone" phoneMask
                 placeholder="(11) 99999-9999" inputmode="numeric"/>
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1" subscriptSizing="dynamic">
          <mat-label>Endereço</mat-label>
          <input matInput formControlName="endereco"/>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="salvar()" [disabled]="loading">
        @if (loading) { Salvando... } @else { <mat-icon>check</mat-icon> Salvar }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-header { display:flex;align-items:center;gap:14px;padding:20px 24px 4px; }
    .dlg-ico    { width:40px;height:40px;background:#fdf4ee;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; mat-icon{color:#d4621e;} }
    h2[mat-dialog-title] { font-size:1.05rem!important;font-weight:700!important;padding:0!important;margin:0 0 2px!important; }
    .dlg-sub    { font-size:.8rem;color:#78716c;margin:0; }
    .err-box    { display:flex;align-items:flex-start;gap:8px;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;padding:9px 12px;border-radius:9px;font-size:.83rem;margin-bottom:14px; }
    .fg         { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  `]
})
export class ClienteDialogComponent {
  form: any; loading = false; error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null,
    private ref: MatDialogRef<ClienteDialogComponent>,
    private fb: FormBuilder, private svc: ClientesService
  ) {
    this.form = this.fb.group({
      nome:     [data?.nome ?? '', Validators.required],
      email:    [data?.email ?? '', [Validators.required, Validators.email]],
      senha:    data ? [''] : ['', [Validators.required, Validators.minLength(6)]],
      cpf:      data ? [''] : ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefone: [data?.telefone ?? ''],
      endereco: [data?.endereco ?? ''],
    });
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    const v = this.form.value;
    const cpf  = v.cpf?.replace(/\D/g, '') ?? '';
    const fone = v.telefone?.replace(/\D/g, '') ?? '';
    const obs$ = this.data
      ? this.svc.atualizar(this.data.id, { telefone: fone, endereco: v.endereco })
      : this.svc.criar({ nome: v.nome, email: v.email, senha: v.senha, cpf, telefone: fone, endereco: v.endereco });
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
    MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, CpfPipe, TelefonePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Clientes</h1>
          <p>{{ filtered.length }} de {{ clientes.length }} clientes</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog(null)">
          <mat-icon>add</mat-icon> Novo Cliente
        </button>
      </div>

      <div class="card-table">
        <div class="toolbar-row">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-label>Buscar por nome, e-mail ou CPF</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="filtrar()"/>
            <mat-icon matSuffix style="color:#a8a29e">search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading) {
          <div class="skel-wrap">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="skel-row">
                <div class="skel" style="width:130px;height:14px"></div>
                <div class="skel" style="width:170px;height:14px"></div>
                <div class="skel" style="width:115px;height:14px"></div>
                <div class="skel" style="width:105px;height:14px"></div>
                <div class="skel" style="width:60px;height:14px;margin-left:auto"></div>
              </div>
            }
          </div>
        } @else {
          <div class="tbl-wrap">
            <table mat-table [dataSource]="paginated">
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef>Nome</th>
                <td mat-cell *matCellDef="let c">
                  <div class="c-nome">
                    <div class="c-av">{{ c.nome.charAt(0).toUpperCase() }}</div>
                    <span>{{ c.nome }}</span>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>E-mail</th>
                <td mat-cell *matCellDef="let c" style="color:#78716c">{{ c.email }}</td>
              </ng-container>
              <ng-container matColumnDef="cpf">
                <th mat-header-cell *matHeaderCellDef>CPF</th>
                <td mat-cell *matCellDef="let c" class="mono">{{ c.cpf | cpf }}</td>
              </ng-container>
              <ng-container matColumnDef="telefone">
                <th mat-header-cell *matHeaderCellDef>Telefone</th>
                <td mat-cell *matCellDef="let c" class="mono">{{ c.telefone | telefone }}</td>
              </ng-container>
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let c">
                  <div style="display:flex;justify-content:flex-end;gap:2px">
                    <button mat-icon-button matTooltip="Editar" (click)="openDialog(c)"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button color="warn" matTooltip="Excluir" (click)="deletar(c)"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>
          </div>

          @if (!filtered.length) {
            <div class="empty-state">
              <mat-icon>people</mat-icon><p>Nenhum cliente encontrado</p>
              @if (search) { <button mat-stroked-button style="margin-top:8px" (click)="search='';filtrar()">Limpar busca</button> }
            </div>
          }

          @if (filtered.length > pageSize) {
            <div class="pagination-row">
              <span class="page-info">{{ (page-1)*pageSize+1 }}–{{ min(page*pageSize,filtered.length) }} de {{ filtered.length }}</span>
              <button (click)="setPage(page-1)" [disabled]="page===1">‹</button>
              @for (p of pageNumbers; track p) {
                <button [class.active]="p===page" (click)="setPage(p)">{{ p }}</button>
              }
              <button (click)="setPage(page+1)" [disabled]="page===totalPages">›</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tbl-wrap { overflow-x:auto; }
    .c-nome { display:flex;align-items:center;gap:9px; }
    .c-av   { width:28px;height:28px;background:#fdf4ee;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#d4621e;flex-shrink:0; }
    .mono   { font-size:.83rem!important;letter-spacing:.01em; }
    .skel-wrap { padding:4px 0; }
    .skel-row  { display:flex;align-items:center;gap:24px;padding:14px 16px;border-bottom:1px solid #f5f5f4; &:last-child{border-bottom:none;} }
    .skel      { background:linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:4px;flex-shrink:0; }
    @keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
  `]
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filtered: Cliente[] = [];
  paginated: Cliente[] = [];
  loading = true; search = '';
  cols = ['nome','email','cpf','telefone','acoes'];
  page = 1; pageSize = 12; totalPages = 1; pageNumbers: number[] = [];

  constructor(private svc: ClientesService, private dialog: MatDialog, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: d => { this.clientes = d; this.filtrar(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filtrar() {
    const q = this.search.toLowerCase();
    const digs = q.replace(/\D/g, '');
    this.filtered = q
      ? this.clientes.filter(c =>
          c.nome.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.cpf ?? '').includes(digs))
      : [...this.clientes];
    this.page = 1; this.updatePag();
  }

  updatePag() {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.page = Math.min(this.page, this.totalPages);
    const s = (this.page - 1) * this.pageSize;
    this.paginated = this.filtered.slice(s, s + this.pageSize);
    const max = 7, half = Math.floor(max / 2);
    let from = Math.max(1, this.page - half);
    let to   = Math.min(this.totalPages, from + max - 1);
    if (to - from < max - 1) from = Math.max(1, to - max + 1);
    this.pageNumbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }

  setPage(p: number) { if (p < 1 || p > this.totalPages) return; this.page = p; this.updatePag(); }
  min(a: number, b: number) { return Math.min(a, b); }

  openDialog(c: Cliente | null) {
    this.dialog.open(ClienteDialogComponent, { width: '500px', data: c })
      .afterClosed().subscribe(r => {
        if (r) { this.snack.open('Cliente salvo!', '', { duration: 2500, verticalPosition: 'top' }); this.load(); }
      });
  }

  deletar(c: Cliente) {
    if (!confirm(`Excluir cliente ${c.nome}?`)) return;
    this.svc.deletar(c.id).subscribe({
      next: () => { this.snack.open('Excluído!', '', { duration: 2500, verticalPosition: 'top' }); this.load(); }
    });
  }
}