import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AgendamentosService, ClientesService, PetsService } from '../../../core/services/api.service';
import { Agendamento } from '../../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{{ hoje }}</p>
        </div>
        <a routerLink="/admin/agendamentos" mat-stroked-button>
          <mat-icon>open_in_full</mat-icon> Ver todos
        </a>
      </div>

      @if (loading) {
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card">
              <div class="skel" style="width:38px;height:38px;border-radius:10px"></div>
              <div style="margin-top:14px">
                <div class="skel" style="width:52px;height:28px;border-radius:6px"></div>
                <div class="skel" style="width:110px;height:13px;border-radius:4px;margin-top:8px"></div>
              </div>
            </div>
          }
        </div>
        <div class="card-table">
          <div class="toolbar-row">
            <div class="skel" style="width:180px;height:16px;border-radius:4px"></div>
          </div>
          @for (i of [1,2,3,4,5]; track i) {
            <div style="display:flex;gap:24px;padding:15px 16px;border-bottom:1px solid #f5f5f4">
              <div class="skel" style="width:80px;height:14px"></div>
              <div class="skel" style="width:110px;height:14px"></div>
              <div class="skel" style="width:90px;height:14px"></div>
              <div class="skel" style="width:70px;height:20px;border-radius:999px;margin-left:auto"></div>
            </div>
          }
        </div>
      }

      @else {

        @if (erroCarregar) {
          <div class="err-box">
            <mat-icon style="font-size:16px;width:16px;height:16px;flex-shrink:0">error_outline</mat-icon>
            {{ erroCarregar }}
          </div>
        }

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-ico orange"><mat-icon>calendar_today</mat-icon></div>
            <p class="stat-val">{{ agendamentosHoje }}</p>
            <p class="stat-lbl">Agendamentos hoje</p>
            @if (agendamentosHoje > 0) {
              <div class="stat-trend"><mat-icon>trending_up</mat-icon></div>
            }
          </div>

          <div class="stat-card">
            <div class="stat-ico yellow"><mat-icon>pending</mat-icon></div>
            <p class="stat-val">{{ pendentes }}</p>
            <p class="stat-lbl">Aguardando confirmação</p>
            @if (pendentes > 0) {
              <div class="stat-badge">{{ pendentes }}</div>
            }
          </div>

          <div class="stat-card">
            <div class="stat-ico purple"><mat-icon>people</mat-icon></div>
            <p class="stat-val">{{ totalClientes }}</p>
            <p class="stat-lbl">Clientes ativos</p>
          </div>

          <div class="stat-card">
            <div class="stat-ico green"><mat-icon>pets</mat-icon></div>
            <p class="stat-val">{{ totalPets }}</p>
            <p class="stat-lbl">Pets cadastrados</p>
          </div>
        </div>

        <!-- Recentes -->
        <div class="card-table">
          <div class="toolbar-row">
            <div class="tbl-title">
              <mat-icon style="color:#d4621e;font-size:18px;width:18px;height:18px">history</mat-icon>
              <strong>Agendamentos Recentes</strong>
            </div>
            <a routerLink="/admin/agendamentos" class="ver-todos">
              Ver todos <mat-icon style="font-size:14px;width:14px;height:14px">arrow_forward</mat-icon>
            </a>
          </div>

          <div style="overflow-x:auto">
            <table mat-table [dataSource]="recentes">

              <ng-container matColumnDef="data">
                <th mat-header-cell *matHeaderCellDef>Data / Hora</th>
                <td mat-cell *matCellDef="let a">
                  <span class="d-main">{{ a.dataHoraInicio | date:'dd/MM' }}</span>
                  <span class="d-time">{{ a.dataHoraInicio | date:'HH:mm' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="pet">
                <th mat-header-cell *matHeaderCellDef>Pet</th>
                <td mat-cell *matCellDef="let a">
                  <div class="cell-pet">
                    <div class="pet-dot">{{ a.nomePet?.charAt(0) }}</div>
                    {{ a.nomePet }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="servico">
                <th mat-header-cell *matHeaderCellDef>Serviço</th>
                <td mat-cell *matCellDef="let a">{{ a.nomeServico }}</td>
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
          </div>

          @if (!recentes.length) {
            <div class="empty-state">
              <mat-icon>calendar_today</mat-icon>
              <p>Nenhum agendamento ainda</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 14px;
      border: 1px solid #e7e5e4;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
      padding: 20px;
      position: relative;
      transition: box-shadow .15s, transform .15s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); }
    }

    .stat-ico {
      width: 38px; height: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
      mat-icon { font-size: 19px; width: 19px; height: 19px; }
      &.orange { background: #fdf4ee; mat-icon { color: #d4621e; } }
      &.yellow { background: #fef9c3; mat-icon { color: #854d0e; } }
      &.purple { background: #ede9fe; mat-icon { color: #7c3aed; } }
      &.green  { background: #dcfce7; mat-icon { color: #16a34a; } }
    }

    .stat-val { font-size: 1.75rem; font-weight: 700; color: #1c1917; margin: 0 0 2px; line-height: 1; letter-spacing: -.03em; }
    .stat-lbl { font-size: .78rem; color: #78716c; margin: 0; }

    .stat-trend {
      position: absolute; top: 16px; right: 16px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #16a34a; }
    }
    .stat-badge {
      position: absolute; top: 14px; right: 14px;
      min-width: 20px; height: 20px; background: #f59e0b;
      border-radius: 999px; font-size: .68rem; font-weight: 700;
      color: white; display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
    }

    .skel {
      background: linear-gradient(90deg, #f5f5f4 25%, #e7e5e4 50%, #f5f5f4 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 4px;
    }
    @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

    .tbl-title { display:flex; align-items:center; gap:7px; font-size:.875rem; }
    .ver-todos {
      display:flex; align-items:center; gap:3px;
      font-size:.78rem; color:#d4621e; font-weight:600;
      text-decoration:none; margin-left:auto;
      &:hover { color:#b85319; }
    }

    .d-main { font-size:.875rem; font-weight:500; color:#1c1917; margin-right:5px; }
    .d-time { font-size:.75rem; color:#78716c; }

    .cell-pet { display:flex; align-items:center; gap:8px; }
    .pet-dot {
      width:26px; height:26px; background:#fdf4ee; border-radius:7px;
      display:flex; align-items:center; justify-content:center;
      font-size:.75rem; font-weight:700; color:#d4621e; flex-shrink:0;
    }

    .err-box {
      display:flex; align-items:flex-start; gap:8px;
      background:#fee2e2; color:#991b1b; border:1px solid #fecaca;
      padding:10px 14px; border-radius:10px; font-size:.875rem; margin-bottom:20px;
    }

    @media (max-width:900px) { .stats-grid { grid-template-columns:1fr 1fr; } }
    @media (max-width:560px) { .stats-grid { grid-template-columns:1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  erroCarregar = '';
  hoje = '';
  agendamentosHoje = 0;
  pendentes = 0;
  totalClientes = 0;
  totalPets = 0;
  recentes: Agendamento[] = [];
  cols = ['data', 'pet', 'servico', 'status'];

  constructor(
    private agSvc: AgendamentosService,
    private clSvc: ClientesService,
    private ptSvc: PetsService
  ) {
    const d = new Date();
    const dias   = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const meses  = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    this.hoje = `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  }

  ngOnInit() {
    forkJoin([
      this.agSvc.listar().pipe(catchError(() => of<Agendamento[]>([]))),
      this.clSvc.listar().pipe(catchError(() => of<any[]>([]))),
      this.ptSvc.listar().pipe(catchError(() => of<any[]>([]))),
    ]).subscribe({
      next: ([ags, cls, pts]) => {
        const hojeStr = new Date().toDateString();
        this.agendamentosHoje = ags.filter(a => new Date(a.dataHoraInicio).toDateString() === hojeStr).length;
        this.pendentes        = ags.filter(a => a.status === 'PENDENTE').length;
        this.totalClientes    = cls.length;
        this.totalPets        = pts.length;
        this.recentes = [...ags]
          .sort((a, b) => new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime())
          .slice(0, 8);
        this.loading = false;
      },
      error: () => {
        this.erroCarregar = 'Erro ao carregar dados. Tente recarregar a página.';
        this.loading = false;
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