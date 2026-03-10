import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { ServicosService, PetsService, AgendamentosService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Servico, Pet } from '../../../shared/models';

const HORARIOS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
const DIAS  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h1>Novo Agendamento</h1>
      <p>{{ stepLabels[step] }}</p>
    </div>

    @if (sucesso) {
      <div class="sucesso-card">
        <div class="sucesso-icon"><mat-icon>check</mat-icon></div>
        <h2>Agendamento solicitado!</h2>
        <p>Nossa equipe confirmará em breve. Acompanhe em <strong>Meus Agendamentos</strong>.</p>
        <div class="sucesso-btns">
          <button mat-stroked-button (click)="resetar()"><mat-icon>add</mat-icon> Novo agendamento</button>
          <button mat-flat-button color="primary" routerLink="/cliente/agendamentos">
            <mat-icon>calendar_today</mat-icon> Ver agendamentos
          </button>
        </div>
      </div>
    }

    @else if (loading) {
      <div class="loading-wrap"><mat-spinner diameter="36"/><p>Carregando serviços...</p></div>
    }

    @else {
      <div class="steps-bar">
        @for (s of stepLabels; track $index) {
          <button class="step-pill"
                  [class.step-active]="step === $index"
                  [class.step-done]="step > $index"
                  [disabled]="$index > step"
                  (click)="step > $index ? step = $index : null">
            <span class="step-num">
              @if (step > $index) {
                <mat-icon style="font-size:12px;width:12px;height:12px;line-height:1">check</mat-icon>
              } @else { {{ $index + 1 }} }
            </span>
            <span class="step-lbl">{{ s }}</span>
          </button>
          @if ($index < stepLabels.length - 1) {
            <div class="step-conn" [class.done]="step > $index"></div>
          }
        }
      </div>

      @if (step === 0) {
        <div class="step-body">
          <p class="intro"><mat-icon>content_cut</mat-icon> Escolha o serviço desejado</p>

          @if (!servicos.length) {
            <div class="info-banner"><mat-icon>info_outline</mat-icon><p>Nenhum serviço disponível.</p></div>
          }

          <div class="card-list">
            @for (s of servicos; track s.id) {
              <div class="opcao" [class.sel]="servicoId === s.id"
                   (click)="servicoId = s.id" role="radio"
                   [attr.aria-checked]="servicoId === s.id" tabindex="0"
                   (keydown.space)="servicoId = s.id; $event.preventDefault()">
                <div class="opcao-left">
                  <div class="opcao-ico"><mat-icon>{{ servicoIcon(s.tipo) }}</mat-icon></div>
                  <div>
                    <p class="opcao-nome">{{ s.nome }}</p>
                    <p class="opcao-meta">{{ s.duracaoMinutos }} min · {{ s.tipo }}</p>
                    @if (s.descricao) { <p class="opcao-desc">{{ s.descricao }}</p> }
                  </div>
                </div>
                <div class="opcao-right">
                  <span class="preco">R$ {{ s.preco | number:'1.2-2' }}</span>
                  @if (servicoId === s.id) { <div class="chk"><mat-icon>check</mat-icon></div> }
                </div>
              </div>
            }
          </div>

          <div class="footer">
            <span></span>
            <button mat-flat-button color="primary" (click)="step=1" [disabled]="!servicoId">
              Próximo <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      }

      @if (step === 1) {
        <div class="step-body">
          <p class="intro"><mat-icon>pets</mat-icon> Selecione o pet</p>

          @if (!pets.length) {
            <div class="no-pets">
              <mat-icon>pets</mat-icon>
              <div>
                <p class="np-title">Nenhum pet cadastrado</p>
                <p class="np-sub"><a routerLink="/cliente/pets">Cadastrar agora →</a></p>
              </div>
            </div>
          } @else {
            <div class="pets-grid">
              @for (p of pets; track p.id) {
                <div class="pet-card" [class.sel]="petId === p.id"
                     (click)="petId = p.id" role="radio" tabindex="0"
                     (keydown.space)="petId = p.id; $event.preventDefault()">
                  <div class="pet-ico">{{ petEmoji(p.especie) }}</div>
                  <div class="pet-info">
                    <p class="pet-nome">{{ p.nome }}</p>
                    <p class="pet-sub">{{ p.especie }} · {{ p.raca || 'SRD' }}</p>
                  </div>
                  @if (petId === p.id) { <div class="chk"><mat-icon>check</mat-icon></div> }
                </div>
              }
            </div>
          }

          <p class="intro" style="margin-top:22px"><mat-icon>calendar_today</mat-icon> Data e horário</p>

          <div class="date-row">
            <mat-form-field appearance="outline" style="width:190px;flex-shrink:0" subscriptSizing="dynamic">
              <mat-label>Data</mat-label>
              <input matInput type="date" [(ngModel)]="data" [min]="minData"/>
            </mat-form-field>
            <div class="horarios">
              @for (h of horarios; track h) {
                <button class="h-btn" [class.sel]="horario===h" (click)="horario=h" type="button">{{ h }}</button>
              }
            </div>
          </div>

          <mat-form-field appearance="outline" style="width:100%;margin-top:4px" subscriptSizing="dynamic">
            <mat-label>Observações (opcional)</mat-label>
            <textarea matInput [(ngModel)]="observacoes" rows="2"
                      placeholder="Ex: meu pet é nervoso com outros animais..."></textarea>
          </mat-form-field>

          <div class="footer">
            <button mat-stroked-button (click)="step=0">
              <mat-icon>arrow_back</mat-icon> Voltar
            </button>
            <button mat-flat-button color="primary" (click)="step=2" [disabled]="!petId||!horario||!data">
              Próximo <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      }

      @if (step === 2) {
        <div class="step-body">
          <p class="intro"><mat-icon>checklist</mat-icon> Confirme os detalhes</p>

          @if (error) {
            <div class="err-box" role="alert">
              <mat-icon style="font-size:15px;width:15px;height:15px;flex-shrink:0">error_outline</mat-icon>
              {{ error }}
            </div>
          }

          <div class="resumo">

            <div class="resumo-row">
              <div class="r-ico"><mat-icon>content_cut</mat-icon></div>
              <div class="r-body">
                <p class="r-lbl">Serviço</p>
                <p class="r-val">{{ servicoSelecionado?.nome }}</p>
                <p class="r-sub">{{ servicoSelecionado?.duracaoMinutos }} min</p>
              </div>
              <span class="r-preco">R$ {{ servicoSelecionado?.preco | number:'1.2-2' }}</span>
            </div>

            <div class="r-div"></div>

            <div class="resumo-row">
              <div class="r-ico"><mat-icon>pets</mat-icon></div>
              <div class="r-body">
                <p class="r-lbl">Pet</p>
                <p class="r-val">{{ petSelecionado?.nome }}</p>
                <p class="r-sub">{{ petSelecionado?.especie }} · {{ petSelecionado?.raca || 'SRD' }}</p>
              </div>
            </div>

            <div class="r-div"></div>

            <div class="resumo-row">
              <div class="r-ico"><mat-icon>schedule</mat-icon></div>
              <div class="r-body">
                <p class="r-lbl">Data e hora</p>
                <p class="r-val">{{ dataFormatada }}</p>
                <p class="r-sub">{{ horario }}h</p>
              </div>
            </div>

            @if (observacoes) {
              <div class="r-div"></div>
              <div class="resumo-row">
                <div class="r-ico"><mat-icon>notes</mat-icon></div>
                <div class="r-body">
                  <p class="r-lbl">Observações</p>
                  <p class="r-val">{{ observacoes }}</p>
                </div>
              </div>
            }

            <div class="r-total">
              <span>Total estimado</span>
              <span class="r-total-val">R$ {{ servicoSelecionado?.preco | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="footer">
            <button mat-stroked-button (click)="step=1" [disabled]="saving">
              <mat-icon>arrow_back</mat-icon> Voltar
            </button>
            <button mat-flat-button color="primary" (click)="agendar()" [disabled]="saving">
              @if (saving) {
                <mat-spinner diameter="16" style="display:inline-block;margin-right:8px"/>
                Agendando...
              } @else {
                <mat-icon>check</mat-icon> Confirmar Agendamento
              }
            </button>
          </div>

        </div>
      }
    }
  `,
  styles: [`
    .loading-wrap { display:flex;flex-direction:column;align-items:center;gap:12px;padding:64px 32px;color:#78716c; p{margin:0;font-size:.875rem;} }

    .sucesso-card { text-align:center;padding:52px 32px;max-width:520px;background:white;border-radius:20px;border:1px solid #e7e5e4;box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .sucesso-icon { width:68px;height:68px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px; mat-icon{color:#16a34a;font-size:34px;width:34px;height:34px;} }
    .sucesso-card h2 { font-size:1.35rem;font-weight:700;margin:0 0 10px; }
    .sucesso-card p  { color:#78716c;margin:0 0 24px;font-size:.9rem;line-height:1.6; }
    .sucesso-btns    { display:flex;gap:12px;justify-content:center;flex-wrap:wrap; }

    .steps-bar { display:flex;align-items:center;margin-bottom:24px;gap:0; }
    .step-pill {
      display:flex;align-items:center;gap:6px;padding:7px 14px;
      border-radius:999px;border:none;background:#f5f5f4;color:#a8a29e;
      font-size:.77rem;font-weight:600;white-space:nowrap;
      cursor:default;transition:all .15s;font-family:inherit;
      &.step-active { background:#fdf4ee;color:#d4621e;outline:2px solid #d4621e;outline-offset:1px; }
      &.step-done   { background:#dcfce7;color:#166534;cursor:pointer; &:hover{background:#bbf7d0;} }
    }
    .step-num {
      width:17px;height:17px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.1);font-size:.7rem;font-weight:700;flex-shrink:0;
    }
    .step-conn { flex:1;height:2px;background:#e7e5e4;margin:0 6px;min-width:12px;transition:background .2s; &.done{background:#a7f3d0;} }

    .step-body { width:100%;max-width:560px; }

    .intro {
      display:flex;align-items:center;gap:7px;
      font-size:.845rem;font-weight:600;color:#44403c;margin:0 0 14px;
      mat-icon{font-size:16px;width:16px;height:16px;color:#d4621e;}
    }

    .card-list   { display:flex;flex-direction:column;gap:8px;margin-bottom:20px; }
    .opcao {
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      padding:13px 15px;border:1.5px solid #e7e5e4;border-radius:12px;
      cursor:pointer;transition:all .14s;background:white;
      &:hover:not(.sel){border-color:#d6d3d1;background:#fafaf9;}
      &.sel{border-color:#d4621e;background:#fdf4ee;}
    }
    .opcao-left  { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
    .opcao-ico   {
      width:36px;height:36px;background:#f5f5f4;border-radius:9px;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      mat-icon{font-size:18px;width:18px;height:18px;color:#78716c;}
      .sel &{background:#ffe8d6; mat-icon{color:#d4621e;}}
    }
    .opcao-nome  { font-weight:600;color:#1c1917;margin:0 0 2px;font-size:.875rem; }
    .opcao-meta  { font-size:.75rem;color:#78716c;margin:0; }
    .opcao-desc  { font-size:.72rem;color:#a8a29e;margin:2px 0 0; }
    .opcao-right { display:flex;align-items:center;gap:8px;flex-shrink:0; }
    .preco       { font-weight:700;color:#d4621e;font-size:.9rem; }
    .chk {
      width:20px;height:20px;background:#d4621e;border-radius:50%;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      mat-icon{font-size:12px;width:12px;height:12px;color:white;}
    }

    .pets-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px; }
    .pet-card  {
      display:flex;align-items:center;gap:10px;
      padding:11px 13px;border:1.5px solid #e7e5e4;border-radius:11px;
      cursor:pointer;transition:all .14s;background:white;position:relative;
      &:hover:not(.sel){border-color:#d6d3d1;background:#fafaf9;}
      &.sel{border-color:#d4621e;background:#fdf4ee;}
    }
    .pet-ico   { width:34px;height:34px;background:#fdf4ee;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0; }
    .pet-info  { flex:1;min-width:0; }
    .pet-nome  { font-weight:600;color:#1c1917;margin:0;font-size:.875rem; }
    .pet-sub   { font-size:.72rem;color:#78716c;margin:0; }

    .date-row  { display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:14px; }
    .horarios  { display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start; }
    .h-btn {
      padding:6px 13px;border:1.5px solid #e7e5e4;border-radius:8px;
      background:white;cursor:pointer;font-size:.82rem;font-weight:500;
      color:#44403c;transition:all .12s;font-family:inherit;
      &:hover:not(.sel){border-color:#d4621e;color:#d4621e;}
      &.sel{background:#d4621e;border-color:#d4621e;color:white;}
    }

    .resumo      { background:#fafaf9;border:1px solid #e7e5e4;border-radius:14px;margin-bottom:20px; }
    .resumo-row  { display:flex;align-items:flex-start;gap:12px;padding:14px 16px; }
    .r-ico {
      width:34px;height:34px;background:white;border-radius:8px;
      border:1px solid #e7e5e4;display:flex;align-items:center;justify-content:center;
      flex-shrink:0;margin-top:1px;
      mat-icon{font-size:16px;width:16px;height:16px;color:#d4621e;}
    }
    .r-body    { flex:1;min-width:0; }
    .r-lbl     { font-size:.68rem;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.05em;margin:0 0 3px; }
    .r-val     { font-size:.9rem;font-weight:600;color:#1c1917;margin:0 0 2px; }
    .r-sub     { font-size:.78rem;color:#78716c;margin:0; }
    .r-preco   { font-size:1rem;font-weight:700;color:#d4621e;white-space:nowrap;flex-shrink:0;align-self:center; }
    .r-div     { height:1px;background:#e7e5e4;margin:0 16px; }
    .r-total   {
      display:flex;align-items:center;justify-content:space-between;
      padding:13px 16px;background:white;
      border-top:1px solid #e7e5e4;border-radius:0 0 13px 13px;
      font-size:.875rem;color:#78716c;font-weight:500;
    }
    .r-total-val { font-size:1.1rem;font-weight:700;color:#d4621e; }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-top: 20px;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .info-banner { display:flex;align-items:center;gap:10px;background:#fdf4ee;border:1px solid #fde8d5;padding:12px 14px;border-radius:10px;margin-bottom:16px;font-size:.875rem;color:#b45309; mat-icon{font-size:18px;width:18px;height:18px;color:#d4621e;flex-shrink:0;} p{margin:0;} }
    .no-pets     { display:flex;align-items:flex-start;gap:12px;background:#fafaf9;border:1px solid #e7e5e4;padding:14px 16px;border-radius:12px;margin-bottom:16px; mat-icon{font-size:20px;width:20px;height:20px;color:#a8a29e;flex-shrink:0;margin-top:2px;} }
    .np-title    { font-weight:600;margin:0 0 4px;color:#1c1917; }
    .np-sub      { color:#78716c;margin:0;font-size:.85rem; a{color:#d4621e;} }
    .err-box     { display:flex;align-items:flex-start;gap:8px;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;padding:10px 14px;border-radius:10px;font-size:.875rem;margin-bottom:16px; }

    @media (max-width:480px) {
      .pets-grid { grid-template-columns:1fr; }
      .date-row  { flex-direction:column; }
      .step-lbl  { display:none; }
      .step-pill { padding:7px 10px; }
    }
  `]
})
export class NovoAgendamentoComponent implements OnInit {
  servicos: Servico[] = [];
  pets: Pet[] = [];
  loading = true; saving = false; sucesso = false; error = '';

  step = 0;
  stepLabels = ['Escolha o serviço', 'Pet e horário', 'Confirmação'];

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
    const pets$ = cid ? this.ptSvc.listarPorCliente(cid) : of<Pet[]>([]);
    forkJoin([this.svSvc.listarAtivos(), pets$]).subscribe({
      next: ([sv, pt]) => { this.servicos = sv; this.pets = pt; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get servicoSelecionado() { return this.servicos.find(s => s.id === this.servicoId); }
  get petSelecionado()     { return this.pets.find(p => p.id === this.petId); }

  get dataFormatada(): string {
    if (!this.data) return '—';
    const [y, m, d] = this.data.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DIAS[dt.getDay()]}, ${d} de ${MESES[m - 1]} de ${y}`;
  }

  servicoIcon(tipo: string): string {
    const map: Record<string,string> = {
      BANHO:'water_drop', TOSA:'content_cut', BANHO_TOSA:'spa',
      CORTE_UNHAS:'content_cut', LIMPEZA_OUVIDOS:'hearing',
      ESCOVACAO_DENTES:'dentistry', CONSULTA:'medical_services',
      VACINA:'vaccines', HIGIENE_COMPLETA:'clean_hands',
    };
    return map[tipo] ?? 'pets';
  }

  petEmoji(especie?: string): string {
    const m: Record<string,string> = { CACHORRO:'🐶',GATO:'🐱',AVE:'🐦',ROEDOR:'🐹',REPTIL:'🦎',OUTRO:'🐾' };
    return m[especie ?? ''] ?? '🐾';
  }

  agendar() {
    this.saving = true; this.error = '';
    this.agSvc.criar({
      petId: this.petId!, servicoId: this.servicoId!,
      dataHoraInicio: `${this.data}T${this.horario}:00`,
      observacoes: this.observacoes || undefined,
    }).subscribe({
      next: () => { this.saving = false; this.sucesso = true; },
      error: e => { this.error = e.error?.mensagem || 'Erro ao criar agendamento.'; this.saving = false; }
    });
  }

  resetar() {
    this.sucesso = false; this.step = 0;
    this.servicoId = null; this.petId = null;
    this.horario = ''; this.data = this.minData;
    this.observacoes = ''; this.error = '';
  }
}