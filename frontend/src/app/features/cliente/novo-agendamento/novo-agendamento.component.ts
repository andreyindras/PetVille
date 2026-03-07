import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ServicosService, PetsService, AgendamentosService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Servico, Pet } from '../../../shared/models';

const HORARIOS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, MatStepperModule, MatButtonModule, MatCardModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <div>
      <div class="page-header">
        <h1>Novo Agendamento</h1>
      </div>

      @if (sucesso) {
        <div class="sucesso-card">
          <mat-icon class="sucesso-icon">check_circle</mat-icon>
          <h2>Agendamento realizado!</h2>
          <p>Você receberá uma confirmação em breve.</p>
          <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
            <button mat-stroked-button (click)="resetar()">Novo agendamento</button>
            <button mat-flat-button color="primary" [routerLink]="['/cliente/agendamentos']">Ver agendamentos</button>
          </div>
        </div>
      } @else if (loading) {
        <div style="display:flex;justify-content:center;padding:64px"><mat-spinner diameter="40"/></div>
      } @else {
        <mat-stepper [linear]="false" #stepper>

          <!-- Step 1: Serviço -->
          <mat-step label="Serviço">
            <div class="step-content">
              <p class="step-hint">Escolha o serviço desejado</p>
              @for (s of servicos; track s.id) {
                <div class="opcao-card" [class.selected]="servicoId === s.id" (click)="servicoId = s.id">
                  <div>
                    <p class="opcao-title">{{ s.nome }}</p>
                    <p class="opcao-sub">{{ s.duracaoMinutos }} min · {{ s.tipo }}</p>
                    @if (s.descricao) { <p class="opcao-desc">{{ s.descricao }}</p> }
                  </div>
                  <span class="opcao-preco">R$ {{ s.preco | number:'1.2-2' }}</span>
                </div>
              }
              <div class="step-actions">
                <button mat-flat-button color="primary" matStepperNext [disabled]="!servicoId">
                  Continuar <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Step 2: Pet & Horário -->
          <mat-step label="Pet e Horário">
            <div class="step-content">
              <p class="step-hint">Selecione o pet</p>
              @if (!pets.length) {
                <div class="no-pets">
                  Nenhum pet cadastrado.
                  <a [routerLink]="['/cliente/pets']" style="color:#d4621e">Cadastrar pet</a>
                </div>
              } @else {
                <div class="pets-grid">
                  @for (p of pets; track p.id) {
                    <div class="opcao-card" [class.selected]="petId === p.id" (click)="petId = p.id">
                      <mat-icon style="font-size:28px;color:#d4621e">pets</mat-icon>
                      <div>
                        <p class="opcao-title" style="margin:0">{{ p.nome }}</p>
                        <p class="opcao-sub" style="margin:0">{{ p.especie }} · {{ p.raca || 'SRD' }}</p>
                      </div>
                    </div>
                  }
                </div>
              }

              <mat-form-field appearance="outline" style="width:200px;margin-top:16px">
                <mat-label>Data</mat-label>
                <input matInput type="date" [(ngModel)]="data" [min]="minData" />
              </mat-form-field>

              <p class="step-hint" style="margin-top:16px">Horário</p>
              <div class="horarios-grid">
                @for (h of horarios; track h) {
                  <button mat-stroked-button [class.horario-sel]="horario === h" (click)="horario = h">{{ h }}</button>
                }
              </div>

              <mat-form-field appearance="outline" style="width:100%;margin-top:16px">
                <mat-label>Observações (opcional)</mat-label>
                <textarea matInput [(ngModel)]="observacoes" rows="2"></textarea>
              </mat-form-field>

              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious><mat-icon>chevron_left</mat-icon> Voltar</button>
                <button mat-flat-button color="primary" matStepperNext [disabled]="!petId || !horario">
                  Continuar <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Step 3: Confirmar -->
          <mat-step label="Confirmar">
            <div class="step-content">
              <p class="step-hint">Confirme os detalhes</p>
              @if (error) { <div class="error-box">{{ error }}</div> }
              <div class="resumo">
                <div class="resumo-row"><span>Serviço</span><span>{{ servicoSelecionado?.nome }}</span></div>
                <div class="resumo-row"><span>Pet</span><span>{{ petSelecionado?.nome }}</span></div>
                <div class="resumo-row"><span>Data e hora</span><span>{{ data | date:'dd/MM/yyyy' }} às {{ horario }}</span></div>
                <div class="resumo-row total"><span>Valor</span><span>R$ {{ servicoSelecionado?.preco | number:'1.2-2' }}</span></div>
              </div>
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious><mat-icon>chevron_left</mat-icon> Voltar</button>
                <button mat-flat-button color="primary" (click)="agendar()" [disabled]="saving">
                  {{ saving ? 'Agendando...' : 'Confirmar Agendamento' }}
                </button>
              </div>
            </div>
          </mat-step>

        </mat-stepper>
      }
    </div>
  `,
  styles: [`
    .step-content { max-width: 560px; padding: 16px 0; }
    .step-hint { font-size:.875rem; font-weight:600; color:#57534e; margin-bottom:12px; }
    .opcao-card {
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      padding:14px 16px; border:2px solid #e7e5e4; border-radius:12px; cursor:pointer;
      margin-bottom:8px; transition:all .15s;
      &.selected { border-color:#d4621e; background:#fdf4ee; }
      &:hover:not(.selected) { border-color:#d6d3d1; }
    }
    .opcao-title { font-weight:600; color:#1c1917; margin:0 0 2px; }
    .opcao-sub { font-size:.8rem; color:#78716c; margin:0; }
    .opcao-desc { font-size:.75rem; color:#a8a29e; margin:2px 0 0; }
    .opcao-preco { font-weight:700; color:#d4621e; white-space:nowrap; }
    .pets-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:4px; }
    .horarios-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-width:300px;
      button { &.horario-sel { background:#d4621e; color:white; border-color:#d4621e; } }
    }
    .step-actions { display:flex; gap:12px; margin-top:20px; }
    .no-pets { font-size:.9rem; color:#78716c; background:#fafaf9; padding:16px; border-radius:12px; margin-bottom:16px; }
    .resumo { background:#fafaf9; border-radius:12px; padding:16px; margin-bottom:16px; }
    .resumo-row { display:flex; justify-content:space-between; font-size:.9rem; padding:6px 0; border-bottom:1px solid #e7e5e4;
      &:last-child { border:none; } span:first-child { color:#78716c; } span:last-child { font-weight:500; }
      &.total span:last-child { color:#d4621e; font-size:1.1rem; font-weight:700; }
    }
    .sucesso-card { text-align:center; padding:64px 32px;
      .sucesso-icon { font-size:64px; width:64px; height:64px; color:#16a34a; }
      h2 { font-size:1.5rem; font-weight:700; margin:16px 0 8px; }
      p { color:#78716c; }
    }
    .error-box { background:#fee2e2; color:#991b1b; padding:10px 14px; border-radius:8px; font-size:.875rem; margin-bottom:12px; }
  `]
})
export class NovoAgendamentoComponent implements OnInit {
  servicos: Servico[] = [];
  pets: Pet[] = [];
  loading = true; saving = false; sucesso = false; error = '';
  servicoId: number | null = null;
  petId: number | null = null;
  horario = '';
  observacoes = '';
  horarios = HORARIOS;
  minData = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  data = this.minData;

  constructor(
    private svSvc: ServicosService, private ptSvc: PetsService,
    private agSvc: AgendamentosService, private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const cid = this.auth.user()?.clienteId;
    forkJoin([this.svSvc.listarAtivos(), cid ? this.ptSvc.listarPorCliente(cid) : [] as any]).subscribe(([sv, pt]) => {
      this.servicos = sv; this.pets = pt; this.loading = false;
    });
  }

  get servicoSelecionado() { return this.servicos.find(s => s.id === this.servicoId); }
  get petSelecionado()     { return this.pets.find(p => p.id === this.petId); }

  agendar() {
    this.saving = true; this.error = '';
    const dataHoraInicio = `${this.data}T${this.horario}:00`;
    this.agSvc.criar({
      petId: this.petId!,
      servicoId: this.servicoId!,
      dataHoraInicio,
      observacoes: this.observacoes,
    }).subscribe({
      next: () => { this.saving = false; this.sucesso = true; },
      error: e => { this.error = e.error?.mensagem || 'Erro ao criar agendamento.'; this.saving = false; }
    });
  }

  resetar() {
    this.sucesso = false; this.servicoId = null; this.petId = null; this.horario = ''; this.data = this.minData;
  }
}