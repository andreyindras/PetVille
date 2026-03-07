import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AgendamentosService, ClientesService, FuncionariosService, PetsService } from '../../../core/services/api.service';
import { Agendamento } from '../../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>{{ today | date:"EEEE, d 'de' MMMM":"":"pt-BR" }}</p>
      </div>

      @if (loading) {
        <div class="spinner-center"><mat-spinner diameter="40" /></div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon class="stat-icon orange">calendar_today</mat-icon>
              <p class="stat-value">{{ agendamentosHoje }}</p>
              <p class="stat-label">Agendamentos hoje</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon class="stat-icon blue">pending</mat-icon>
              <p class="stat-value">{{ pendentes }}</p>
              <p class="stat-label">Pendentes</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon class="stat-icon purple">people</mat-icon>
              <p class="stat-value">{{ totalClientes }}</p>
              <p class="stat-label">Clientes</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon class="stat-icon green">pets</mat-icon>
              <p class="stat-value">{{ totalPets }}</p>
              <p class="stat-label">Pets cadastrados</p>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="card-table">
          <div class="toolbar-row">
            <strong>Agendamentos Recentes</strong>
          </div>
          <table mat-table [dataSource]="recentes">
            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let a">{{ a.nomePet }}</td>
            </ng-container>
            <ng-container matColumnDef="servico">
              <th mat-header-cell *matHeaderCellDef>Serviço</th>
              <td mat-cell *matCellDef="let a">{{ a.nomeServico }}</td>
            </ng-container>
            <ng-container matColumnDef="data">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let a">{{ a.dataHoraInicio | date:'dd/MM HH:mm' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="status-chip {{ a.status }}">{{ statusLabel(a.status) }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (!recentes.length) {
            <div class="empty-state"><mat-icon>calendar_today</mat-icon><p>Nenhum agendamento</p></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .spinner-center { display:flex; justify-content:center; padding: 64px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { border-radius: 12px !important; border: 1px solid #e7e5e4 !important; box-shadow: 0 1px 3px rgba(0,0,0,.06) !important; }
    mat-card-content { display:flex; flex-direction:column; gap:4px; padding: 20px !important; }
    .stat-icon { font-size:36px; width:36px; height:36px; margin-bottom:8px; border-radius:10px; padding:6px;
      &.orange { background:#fdf4ee; color:#d4621e; }
      &.blue   { background:#dbeafe; color:#1d4ed8; }
      &.purple { background:#ede9fe; color:#7c3aed; }
      &.green  { background:#dcfce7; color:#15803d; }
    }
    .stat-value { font-size:1.75rem; font-weight:700; color:#1c1917; margin:0; }
    .stat-label { font-size:.8rem; color:#78716c; margin:0; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  today = new Date();
  agendamentosHoje = 0; pendentes = 0; totalClientes = 0; totalPets = 0;
  recentes: Agendamento[] = [];
  cols = ['cliente', 'servico', 'data', 'status'];

  constructor(
    private agSvc: AgendamentosService,
    private clSvc: ClientesService,
    private fnSvc: FuncionariosService,
    private ptSvc: PetsService
  ) {}

  ngOnInit() {
    forkJoin([this.agSvc.listar(), this.clSvc.listar(), this.ptSvc.listar()]).subscribe({
      next: ([ags, cls, pts]) => {
        const hoje = new Date().toDateString();
        this.agendamentosHoje = ags.filter(a => new Date(a.dataHoraInicio).toDateString() === hoje).length;
        this.pendentes = ags.filter(a => a.status === 'PENDENTE').length;
        this.totalClientes = cls.length;
        this.totalPets = pts.length;
        this.recentes = [...ags].sort((a, b) =>
          new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime()
        ).slice(0, 8);
        this.loading = false;
      }
    });
  }

  statusLabel(s: string) {
    const m: Record<string, string> = {
      PENDENTE:'Pendente', CONFIRMADO:'Confirmado', EM_ANDAMENTO:'Em andamento',
      CONCLUIDO:'Concluído', CANCELADO:'Cancelado'
    };
    return m[s] ?? s;
  }
}