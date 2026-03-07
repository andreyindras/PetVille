import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgendamentosService, FuncionariosService } from '../../../core/services/api.service';
import { Agendamento, Funcionario, StatusAgendamento } from '../../../shared/models';

@Component({
  selector: 'app-atribuir-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Atribuir Funcionário</h2>
    <mat-dialog-content>
      <p style="color:#78716c;font-size:.9rem;margin-bottom:16px">
        Agendamento: <strong>{{ data.ag.nomeServico }}</strong> — <strong>{{ data.ag.nomePet }}</strong>
      </p>
      @if (error) { <div class="error-box">{{ error }}</div> }
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Funcionário</mat-label>
        <mat-select [(ngModel)]="funcId">
          @for (f of data.funcionarios; track f.id) {
            <mat-option [value]="f.id">{{ f.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="salvar()" [disabled]="loading || !funcId">
        {{ loading ? 'Salvando...' : 'Atribuir' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.error-box { background:#fee2e2; color:#991b1b; padding:8px 12px; border-radius:8px; font-size:.85rem; margin-bottom:12px; }`]
})
export class AtribuirDialogComponent {
  funcId: number | null = null;
  loading = false; error = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ag: Agendamento; funcionarios: Funcionario[] },
    private ref: MatDialogRef<AtribuirDialogComponent>,
    private svc: AgendamentosService
  ) {
    this.funcId = data.ag.funcionarioId ?? null;
  }
  salvar() {
    if (!this.funcId) return;
    this.loading = true; this.error = '';
    this.svc.atribuirFuncionario(this.data.ag.id, this.funcId).subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro.'; this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule,
    MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Agendamentos</h1>
        <p>{{ filtered.length }} agendamento(s) encontrado(s)</p>
      </div>

      <div class="card-table">
        <div class="toolbar-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="filtrar()" placeholder="Pet, serviço ou funcionário..." />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:180px">
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
        </div>

        @if (loading) {
          <div style="display:flex;justify-content:center;padding:40px"><mat-spinner diameter="36"/></div>
        } @else {
          <table mat-table [dataSource]="filtered">

            <ng-container matColumnDef="data">
              <th mat-header-cell *matHeaderCellDef>Data/Hora</th>
              <td mat-cell *matCellDef="let a">{{ a.dataHoraInicio | date:'dd/MM/yyyy HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="pet">
              <th mat-header-cell *matHeaderCellDef>Pet</th>
              <td mat-cell *matCellDef="let a">{{ a.nomePet }}</td>
            </ng-container>

            <ng-container matColumnDef="servico">
              <th mat-header-cell *matHeaderCellDef>Serviço</th>
              <td mat-cell *matCellDef="let a">{{ a.nomeServico }}</td>
            </ng-container>

            <ng-container matColumnDef="funcionario">
              <th mat-header-cell *matHeaderCellDef>Funcionário</th>
              <td mat-cell *matCellDef="let a">{{ a.nomeFuncionario || '—' }}</td>
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
                <button mat-icon-button matTooltip="Atribuir funcionário"
                  (click)="openAtribuir(a)" [disabled]="['CONCLUIDO','CANCELADO'].includes(a.status)">
                  <mat-icon>person_add</mat-icon>
                </button>
                @if (a.status === 'PENDENTE') {
                  <button mat-icon-button matTooltip="Confirmar" (click)="acao(a, 'confirmar')">
                    <mat-icon style="color:#16a34a">check_circle</mat-icon>
                  </button>
                }
                @if (a.status === 'CONFIRMADO') {
                  <button mat-icon-button matTooltip="Iniciar" (click)="acao(a, 'iniciar')">
                    <mat-icon style="color:#1d4ed8">play_circle</mat-icon>
                  </button>
                }
                @if (a.status === 'EM_ANDAMENTO') {
                  <button mat-icon-button matTooltip="Concluir" (click)="acao(a, 'concluir')">
                    <mat-icon style="color:#7c3aed">task_alt</mat-icon>
                  </button>
                }
                @if (!['CONCLUIDO','CANCELADO'].includes(a.status)) {
                  <button mat-icon-button color="warn" matTooltip="Cancelar" (click)="cancelar(a)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>

          @if (!filtered.length) {
            <div class="empty-state">
              <mat-icon>calendar_today</mat-icon>
              <p>Nenhum agendamento encontrado</p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class AgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  filtered: Agendamento[] = [];
  funcionarios: Funcionario[] = [];
  loading = true;
  search = '';
  statusFiltro = '';
  cols = ['data', 'pet', 'servico', 'funcionario', 'status', 'acoes'];

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
    this.svc.listar().subscribe(data => {
      this.agendamentos = data.sort((a, b) =>
        new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime()
      );
      this.filtrar();
      this.loading = false;
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
  }

  openAtribuir(ag: Agendamento) {
    const ref = this.dialog.open(AtribuirDialogComponent, {
      width: '400px',
      data: { ag, funcionarios: this.funcionarios }
    });
    ref.afterClosed().subscribe(r => {
      if (r) { this.snack.open('Funcionário atribuído!', '', { duration: 2500 }); this.load(); }
    });
  }

  acao(ag: Agendamento, tipo: 'confirmar' | 'iniciar' | 'concluir') {
    const req$ = tipo === 'confirmar' ? this.svc.confirmar(ag.id)
      : tipo === 'iniciar' ? this.svc.iniciar(ag.id)
      : this.svc.concluir(ag.id);
    const labels = { confirmar: 'Confirmado!', iniciar: 'Iniciado!', concluir: 'Concluído!' };
    req$.subscribe(() => { this.snack.open(labels[tipo], '', { duration: 2500 }); this.load(); });
  }

  cancelar(ag: Agendamento) {
    if (!confirm(`Cancelar agendamento de ${ag.nomeServico} para ${ag.nomePet}?`)) return;
    this.svc.cancelar(ag.id, 'Cancelado pelo admin').subscribe(() => {
      this.snack.open('Cancelado!', '', { duration: 2500 }); this.load();
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