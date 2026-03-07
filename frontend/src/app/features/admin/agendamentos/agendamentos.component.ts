import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgendamentosService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Agendamento } from '../../../shared/models';

@Component({
  selector: 'app-cancelar-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Cancelar Agendamento</h2>
    <mat-dialog-content>
      <p style="color:#78716c;font-size:.9rem;margin-bottom:16px">
        Cancelar <strong>{{ data.ag.nomeServico }}</strong> para <strong>{{ data.ag.nomePet }}</strong>?
      </p>
      @if (error) { <div class="error-box">{{ error }}</div> }
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Motivo (opcional)</mat-label>
        <textarea matInput [(ngModel)]="motivo" rows="3"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Voltar</button>
      <button mat-flat-button color="warn" (click)="cancelar()" [disabled]="loading">
        {{ loading ? 'Cancelando...' : 'Cancelar agendamento' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.error-box { background:#fee2e2; color:#991b1b; padding:8px 12px; border-radius:8px; font-size:.85rem; margin-bottom:12px; }`]
})
export class CancelarDialogComponent {
  motivo = ''; loading = false; error = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ag: Agendamento },
    private ref: MatDialogRef<CancelarDialogComponent>,
    private svc: AgendamentosService
  ) {}
  cancelar() {
    this.loading = true; this.error = '';
    this.svc.cancelar(this.data.ag.id, this.motivo || 'Cancelado pelo cliente').subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro.'; this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-agendamentos-cliente',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Meus Agendamentos</h1>
        <p>Acompanhe seus serviços agendados</p>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:64px"><mat-spinner diameter="40"/></div>
      } @else {
        <section class="section">
          <h2 class="section-title">Próximos ({{ ativos.length }})</h2>
          @if (!ativos.length) {
            <mat-card class="empty-card">
              <mat-card-content>
                Nenhum agendamento ativo.
                <a href="/cliente/novo-agendamento" style="color:#d4621e">Agendar agora</a>
              </mat-card-content>
            </mat-card>
          }
          @for (ag of ativos; track ag.id) {
            <mat-card class="ag-card">
              <mat-card-content>
                <div class="ag-row">
                  <div class="date-badge">
                    <span class="day">{{ ag.dataHoraInicio | date:'dd' }}</span>
                    <span class="mon">{{ ag.dataHoraInicio | date:'MMM' }}</span>
                  </div>
                  <div class="ag-info">
                    <p class="ag-title">{{ ag.nomeServico }}</p>
                    <p class="ag-sub">{{ ag.nomePet }} · {{ ag.dataHoraInicio | date:'HH:mm' }}
                      @if (ag.nomeFuncionario) { · {{ ag.nomeFuncionario }} }
                    </p>
                    <span class="status-chip {{ ag.status }}">{{ statusLabel(ag.status) }}</span>
                  </div>
                  @if (['PENDENTE','CONFIRMADO'].includes(ag.status)) {
                    <button mat-stroked-button color="warn" (click)="openCancelar(ag)">
                      <mat-icon>cancel</mat-icon> Cancelar
                    </button>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </section>

        @if (historico.length) {
          <section class="section">
            <h2 class="section-title">Histórico</h2>
            <mat-card>
              @for (ag of historico.slice(0,10); track ag.id) {
                <div class="hist-row">
                  <div>
                    <p style="font-size:.9rem;font-weight:500;margin:0">{{ ag.nomeServico }} — {{ ag.nomePet }}</p>
                    <p style="font-size:.8rem;color:#78716c;margin:0">{{ ag.dataHoraInicio | date:"dd/MM/yyyy 'às' HH:mm" }}</p>
                  </div>
                  <span class="status-chip {{ ag.status }}">{{ statusLabel(ag.status) }}</span>
                </div>
              }
            </mat-card>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .section { margin-bottom: 32px; }
    .section-title { font-size:.875rem; font-weight:600; color:#57534e; margin-bottom:12px; }
    .ag-card { margin-bottom:12px; border-radius:12px !important; border:1px solid #e7e5e4 !important; box-shadow:0 1px 3px rgba(0,0,0,.06) !important; }
    .empty-card { border-radius:12px !important; border:1px solid #e7e5e4 !important; text-align:center; padding:16px; font-size:.9rem; color:#78716c; }
    .ag-row { display:flex; align-items:center; gap:16px; }
    .date-badge { width:48px; height:48px; background:#fdf4ee; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0;
      .day { font-weight:700; font-size:1.1rem; color:#d4621e; line-height:1; }
      .mon { font-size:.7rem; color:#e87d35; text-transform:uppercase; }
    }
    .ag-info { flex:1; min-width:0; }
    .ag-title { font-weight:600; color:#1c1917; margin:0 0 2px; }
    .ag-sub { font-size:.8rem; color:#78716c; margin:0 0 6px; }
    .hist-row { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #f5f5f4;
      &:last-child { border-bottom:none; } }
  `]
})
export class AgendamentosClienteComponent implements OnInit {
  ativos: Agendamento[] = [];
  historico: Agendamento[] = [];
  loading = true;

  constructor(
    private svc: AgendamentosService, private auth: AuthService,
    private dialog: MatDialog, private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() {
    const cid = this.auth.user()?.clienteId;
    if (!cid) return;
    this.svc.listarPorCliente(cid).subscribe(ags => {
      this.ativos = ags.filter(a => !['CANCELADO','CONCLUIDO'].includes(a.status))
        .sort((a,b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime());
      this.historico = ags.filter(a => ['CANCELADO','CONCLUIDO'].includes(a.status))
        .sort((a,b) => new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime());
      this.loading = false;
    });
  }

  openCancelar(ag: Agendamento) {
    const ref = this.dialog.open(CancelarDialogComponent, { width: '420px', data: { ag } });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Agendamento cancelado!', '', { duration: 2500 }); this.load(); } });
  }

  statusLabel(s: string) {
    return ({ PENDENTE:'Pendente', CONFIRMADO:'Confirmado', EM_ANDAMENTO:'Em andamento', CONCLUIDO:'Concluído', CANCELADO:'Cancelado' } as any)[s] ?? s;
  }
}