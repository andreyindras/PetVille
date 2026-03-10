import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgendamentosService, FuncionariosService } from '../../../core/services/api.service';
import { Agendamento, Funcionario } from '../../../shared/models';

// ─── Atribuir Funcionário Dialog ─────────────────────────────────────────────
@Component({
  selector: 'app-atribuir-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <div class="dialog-icon"><mat-icon>person_add</mat-icon></div>
      <div>
        <h2 mat-dialog-title>Atribuir Funcionário</h2>
        <p class="dialog-subtitle">{{ data.ag.nomeServico }} · {{ data.ag.nomePet }}</p>
      </div>
    </div>

    <mat-dialog-content>
      @if (error) {
        <div class="error-box">
          <mat-icon style="font-size:15px;width:15px;height:15px">error_outline</mat-icon>
          {{ error }}
        </div>
      }
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Funcionário responsável</mat-label>
        <mat-select [(ngModel)]="funcId">
          <mat-option [value]="null">— Sem atribuição —</mat-option>
          @for (f of data.funcionarios; track f.id) {
            <mat-option [value]="f.id">{{ f.nome }}</mat-option>
          }
        </mat-select>
        <mat-icon matPrefix style="color:#78716c;margin-right:4px">badge</mat-icon>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="salvar()" [disabled]="loading || funcId === null">
        @if (loading) { <span>Salvando...</span> } @else { <mat-icon>check</mat-icon> Atribuir }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header { display:flex; align-items:center; gap:14px; padding:20px 24px 4px; }
    .dialog-icon { width:40px; height:40px; background:#fdf4ee; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; mat-icon { color:#d4621e; } }
    h2[mat-dialog-title] { font-size:1.05rem !important; font-weight:700 !important; padding:0 !important; margin:0 0 2px !important; }
    .dialog-subtitle { font-size:0.8rem; color:#78716c; margin:0; }
    .error-box { display:flex; align-items:center; gap:7px; background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:9px 12px; border-radius:9px; font-size:.83rem; margin-bottom:14px; }
  `]
})
export class AtribuirDialogComponent {
  funcId: number | null = null;
  loading = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ag: Agendamento; funcionarios: Funcionario[] },
    private ref: MatDialogRef<AtribuirDialogComponent>,
    private svc: AgendamentosService
  ) {
    this.funcId = data.ag.funcionarioId ?? null;
  }

  salvar() {
    if (!this.funcId) return;
    this.loading = true;
    this.error = '';
    this.svc.atribuirFuncionario(this.data.ag.id, this.funcId).subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro ao atribuir.'; this.loading = false; }
    });
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div>
          <h1>Agendamentos</h1>
          <p>{{ filtered.length }} de {{ agendamentos.length }} agendamento(s)</p>
        </div>
      </div>

      <div class="card-table">

        <!-- Toolbar -->
        <div class="toolbar-row">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-label>Buscar por pet, serviço ou funcionário</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="filtrar()" />
            <mat-icon matSuffix style="color:#a8a29e">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:172px" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFiltro" (ngModelChange)="filtrar()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="PENDENTE">Pendente</mat-option>
              <mat-option value="CONFIRMADO">Confirmado</mat-option>
              <mat-option value="EM_ANDAMENTO">Em andamento</mat-option>
              <mat-option value="CONCLUIDO">Concluído</mat-option>
              <mat-option value="CANCELADO">Cancelado</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-icon-button (click)="load()" matTooltip="Atualizar" [class.spinning]="loading">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <!-- Skeleton -->
        @if (loading) {
          <div class="skeleton-table">
            @for (i of skeletonRows; track i) {
              <div class="skeleton-row">
                <div class="skeleton" style="width:110px;height:14px"></div>
                <div class="skeleton" style="width:80px;height:14px"></div>
                <div class="skeleton" style="width:120px;height:14px"></div>
                <div class="skeleton" style="width:90px;height:14px"></div>
                <div class="skeleton" style="width:70px;height:20px;border-radius:999px"></div>
                <div class="skeleton" style="width:80px;height:14px;margin-left:auto"></div>
              </div>
            }
          </div>
        } @else {

          <!-- Table -->
          <div class="table-scroll-wrapper">
            <table mat-table [dataSource]="paged">

              <ng-container matColumnDef="data">
                <th mat-header-cell *matHeaderCellDef>Data / Hora</th>
                <td mat-cell *matCellDef="let a">
                  <div class="cell-date">
                    <span class="date-main">{{ a.dataHoraInicio | date:'dd/MM/yyyy' }}</span>
                    <span class="date-time">{{ a.dataHoraInicio | date:'HH:mm' }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="pet">
                <th mat-header-cell *matHeaderCellDef>Pet</th>
                <td mat-cell *matCellDef="let a">
                  <div class="cell-pet">
                    <div class="pet-avatar">{{ a.nomePet.charAt(0) }}</div>
                    <span>{{ a.nomePet }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="servico">
                <th mat-header-cell *matHeaderCellDef>Serviço</th>
                <td mat-cell *matCellDef="let a">{{ a.nomeServico }}</td>
              </ng-container>

              <ng-container matColumnDef="funcionario">
                <th mat-header-cell *matHeaderCellDef>Funcionário</th>
                <td mat-cell *matCellDef="let a">
                  @if (a.nomeFuncionario) {
                    <span class="func-name">{{ a.nomeFuncionario }}</span>
                  } @else {
                    <span class="unassigned">Não atribuído</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let a">
                  <span class="status-chip {{ a.status }}">{{ statusLabel(a.status) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let a">
                  <div class="actions-cell">
                    <button mat-icon-button matTooltip="Atribuir funcionário"
                      (click)="openAtribuir(a)"
                      [disabled]="['CONCLUIDO','CANCELADO'].includes(a.status)">
                      <mat-icon>person_add</mat-icon>
                    </button>

                    @if (a.status === 'PENDENTE') {
                      <button mat-icon-button matTooltip="Confirmar" (click)="acao(a, 'confirmar')">
                        <mat-icon class="icon-success">check_circle</mat-icon>
                      </button>
                    }
                    @if (a.status === 'CONFIRMADO') {
                      <button mat-icon-button matTooltip="Iniciar" (click)="acao(a, 'iniciar')">
                        <mat-icon class="icon-info">play_circle</mat-icon>
                      </button>
                    }
                    @if (a.status === 'EM_ANDAMENTO') {
                      <button mat-icon-button matTooltip="Concluir" (click)="acao(a, 'concluir')">
                        <mat-icon class="icon-purple">task_alt</mat-icon>
                      </button>
                    }
                    @if (!['CONCLUIDO','CANCELADO'].includes(a.status)) {
                      <button mat-icon-button color="warn" matTooltip="Cancelar" (click)="cancelar(a)">
                        <mat-icon>cancel</mat-icon>
                      </button>
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>
          </div>

          @if (!filtered.length) {
            <div class="empty-state">
              <mat-icon>calendar_today</mat-icon>
              <p>Nenhum agendamento encontrado</p>
              @if (search || statusFiltro) {
                <button mat-stroked-button style="margin-top:8px" (click)="clearFilters()">Limpar filtros</button>
              }
            </div>
          }

          <!-- Pagination -->
          @if (filtered.length > pageSize) {
            <div class="pagination-row">
              <span class="page-info">
                {{ (page - 1) * pageSize + 1 }}–{{ min(page * pageSize, filtered.length) }}
                de {{ filtered.length }}
              </span>
              <button (click)="setPage(page - 1)" [disabled]="page === 1" aria-label="Página anterior">‹</button>
              @for (p of pageNumbers; track p) {
                <button (click)="setPage(p)" [class.active]="p === page">{{ p }}</button>
              }
              <button (click)="setPage(page + 1)" [disabled]="page === totalPages" aria-label="Próxima página">›</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .table-scroll-wrapper { overflow-x: auto; }

    .skeleton-table { padding: 8px 0; }
    .skeleton-row {
      display: flex; align-items: center; gap: 24px;
      padding: 16px 16px; border-bottom: 1px solid #f5f5f4;
      &:last-child { border-bottom: none; }
    }
    .skeleton {
      background: linear-gradient(90deg, #f5f5f4 25%, #e7e5e4 50%, #f5f5f4 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 4px;
      flex-shrink: 0;
    }
    @keyframes shimmer {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }

    .cell-date { display:flex; flex-direction:column; line-height:1.3; }
    .date-main { font-size:0.875rem; font-weight:500; color:#1c1917; }
    .date-time { font-size:0.75rem; color:#78716c; }

    .cell-pet { display:flex; align-items:center; gap:8px; }
    .pet-avatar {
      width:28px; height:28px; background:#fdf4ee; border-radius:7px;
      display:flex; align-items:center; justify-content:center;
      font-size:0.78rem; font-weight:700; color:#d4621e; flex-shrink:0;
    }

    .func-name { font-size:0.875rem; color:#1c1917; }
    .unassigned { font-size:0.8rem; color:#a8a29e; font-style:italic; }

    .actions-cell { display:flex; align-items:center; justify-content:flex-end; gap:2px; }
    .icon-success { color:#16a34a !important; }
    .icon-info    { color:#1d4ed8 !important; }
    .icon-purple  { color:#7c3aed !important; }

    .spinning mat-icon {
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class AgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  filtered: Agendamento[] = [];
  paged: Agendamento[] = [];
  funcionarios: Funcionario[] = [];
  loading = true;
  search = '';
  statusFiltro = '';
  cols = ['data', 'pet', 'servico', 'funcionario', 'status', 'acoes'];
  skeletonRows = [1,2,3,4,5,6,7,8];

  // Pagination
  page = 1;
  pageSize = 10;
  totalPages = 1;
  pageNumbers: number[] = [];

  constructor(
    private svc: AgendamentosService,
    private funcSvc: FuncionariosService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.funcSvc.listar().subscribe(f => this.funcionarios = f);
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: data => {
        this.agendamentos = data.sort((a, b) =>
          new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime()
        );
        this.filtrar();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filtrar() {
    const q = this.search.toLowerCase();
    this.filtered = this.agendamentos.filter(a => {
      const matchSearch = !q ||
        a.nomePet.toLowerCase().includes(q) ||
        a.nomeServico.toLowerCase().includes(q) ||
        (a.nomeFuncionario ?? '').toLowerCase().includes(q);
      const matchStatus = !this.statusFiltro || a.status === this.statusFiltro;
      return matchSearch && matchStatus;
    });
    this.page = 1;
    this.updatePagination();
  }

  clearFilters() {
    this.search = '';
    this.statusFiltro = '';
    this.filtrar();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.page = Math.min(this.page, this.totalPages);
    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);

    // Show max 7 page buttons
    const maxBtn = 7;
    const half = Math.floor(maxBtn / 2);
    let from = Math.max(1, this.page - half);
    let to = Math.min(this.totalPages, from + maxBtn - 1);
    if (to - from < maxBtn - 1) from = Math.max(1, to - maxBtn + 1);
    this.pageNumbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.updatePagination();
  }

  min(a: number, b: number) { return Math.min(a, b); }

  openAtribuir(ag: Agendamento) {
    const ref = this.dialog.open(AtribuirDialogComponent, {
      width: '420px',
      data: { ag, funcionarios: this.funcionarios }
    });
    ref.afterClosed().subscribe(r => {
      if (r) {
        this.snack.open('Funcionário atribuído!', '', { duration: 2500, verticalPosition: 'top' });
        this.load();
      }
    });
  }

  acao(ag: Agendamento, tipo: 'confirmar' | 'iniciar' | 'concluir') {
    const req$ = tipo === 'confirmar' ? this.svc.confirmar(ag.id)
      : tipo === 'iniciar' ? this.svc.iniciar(ag.id)
      : this.svc.concluir(ag.id);
    const labels = { confirmar: 'Confirmado!', iniciar: 'Iniciado!', concluir: 'Concluído!' };
    req$.subscribe({
      next: () => {
        this.snack.open(labels[tipo], '', { duration: 2500, verticalPosition: 'top' });
        this.load();
      },
      error: e => {
        this.snack.open(e.error?.mensagem || 'Erro ao atualizar.', '', { duration: 3000, verticalPosition: 'top' });
      }
    });
  }

  cancelar(ag: Agendamento) {
    if (!confirm(`Cancelar agendamento de ${ag.nomeServico} para ${ag.nomePet}?`)) return;
    this.svc.cancelar(ag.id, 'Cancelado pelo admin').subscribe({
      next: () => {
        this.snack.open('Cancelado.', '', { duration: 2500, verticalPosition: 'top' });
        this.load();
      }
    });
  }

  statusLabel(s: string) {
    const m: Record<string, string> = {
      PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', EM_ANDAMENTO: 'Em andamento',
      CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado'
    };
    return m[s] ?? s;
  }
}