import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PetsService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pet } from '../../../shared/models';

const ESPECIES = ['CACHORRO','GATO','AVE','ROEDOR','REPTIL','OUTRO'];
const EMOJIS: Record<string, string> = { CACHORRO:'🐶', GATO:'🐱', AVE:'🐦', ROEDOR:'🐹', REPTIL:'🦎', OUTRO:'🐾' };

@Component({
  selector: 'app-pet-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Pet' : 'Novo Pet' }}</h2>
    <mat-dialog-content>
      @if (error) { <div class="error-box">{{ error }}</div> }
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Espécie</mat-label>
          <mat-select formControlName="especie">
            @for (e of especies; track e) { <mat-option [value]="e">{{ e }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Raça</mat-label>
          <input matInput formControlName="raca" placeholder="Ex: Labrador" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Idade</mat-label>
          <input matInput type="number" formControlName="idade" />
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Observações de saúde</mat-label>
          <textarea matInput formControlName="observacoes" rows="2" placeholder="Alergias, medicamentos..."></textarea>
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
export class PetDialogComponent {
  form: any;
  loading = false; error = '';
  especies = ESPECIES;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pet?: Pet; clienteId: number },
    private ref: MatDialogRef<PetDialogComponent>,
    private fb: FormBuilder, private svc: PetsService
  ) {
    this.form = this.fb.group({
      nome: [data.pet?.nome ?? '', Validators.required],
      especie: [data.pet?.especie ?? 'CACHORRO'],
      raca: [data.pet?.raca ?? ''],
      idade: [data.pet?.idade ?? ''],
      observacoes: [data.pet?.observacoes ?? ''],
    });
  }

  salvar() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const v = this.form.value;
    const obs$ = this.data.pet
      ? this.svc.atualizar(this.data.pet.id, v)
      : this.svc.criar(this.data.clienteId, v);
    obs$.subscribe({
      next: () => this.ref.close(true),
      error: e => { this.error = e.error?.mensagem || 'Erro ao salvar.'; this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div>
      <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between">
        <div>
          <h1>Meus Pets</h1>
          <p>{{ pets.length }} pet{{ pets.length !== 1 ? 's' : '' }} cadastrado{{ pets.length !== 1 ? 's' : '' }}</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Novo Pet
        </button>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:64px"><mat-spinner diameter="40"/></div>
      } @else if (!pets.length) {
        <div class="empty-state">
          <mat-icon>pets</mat-icon>
          <p>Nenhum pet cadastrado</p>
          <button mat-flat-button color="primary" (click)="openDialog()"><mat-icon>add</mat-icon> Cadastrar pet</button>
        </div>
      } @else {
        <div class="pets-grid">
          @for (p of pets; track p.id) {
            <mat-card class="pet-card">
              <mat-card-content>
                <div class="pet-row">
                  <div class="pet-emoji">{{ emoji(p.especie) }}</div>
                  <div class="pet-info">
                    <p class="pet-name">{{ p.nome }}</p>
                    <p class="pet-sub">{{ p.especie }} · {{ p.raca || 'SRD' }}</p>
                  </div>
                  <div class="pet-actions">
                    <button mat-icon-button (click)="openDialog(p)"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button color="warn" (click)="deletar(p)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
                @if (p.idade || p.observacoes) {
                  <div class="pet-extra">
                    @if (p.idade) { <span>🎂 {{ p.idade }} ano{{ p.idade !== 1 ? 's' : '' }}</span> }
                    @if (p.observacoes) { <span class="obs">{{ p.observacoes }}</span> }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .pets-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
    .pet-card { border-radius:12px !important; border:1px solid #e7e5e4 !important; box-shadow:0 1px 3px rgba(0,0,0,.06) !important; }
    .pet-row { display:flex; align-items:center; gap:12px; }
    .pet-emoji { width:48px; height:48px; background:#fdf4ee; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; }
    .pet-info { flex:1; min-width:0; }
    .pet-name { font-weight:600; color:#1c1917; margin:0; }
    .pet-sub { font-size:.8rem; color:#78716c; margin:0; }
    .pet-actions { display:flex; }
    .pet-extra { margin-top:10px; padding-top:10px; border-top:1px solid #f5f5f4; display:flex; flex-wrap:wrap; gap:8px; font-size:.8rem; color:#78716c;
      .obs { font-style:italic; color:#a8a29e; }
    }
  `]
})
export class PetsComponent implements OnInit {
  pets: Pet[] = [];
  loading = true;

  constructor(
    private svc: PetsService, private auth: AuthService,
    private dialog: MatDialog, private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() {
    const cid = this.auth.user()?.clienteId;
    if (!cid) return;
    this.svc.listarPorCliente(cid).subscribe(data => { this.pets = data; this.loading = false; });
  }

  emoji(e?: string) { return EMOJIS[e ?? ''] ?? '🐾'; }

  openDialog(pet?: Pet) {
    const cid = this.auth.user()?.clienteId!;
    const ref = this.dialog.open(PetDialogComponent, { width: '480px', data: { pet, clienteId: cid } });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open('Pet salvo!', '', { duration: 2500 }); this.load(); } });
  }

  deletar(p: Pet) {
    if (!confirm(`Remover ${p.nome}?`)) return;
    this.svc.deletar(p.id).subscribe(() => { this.snack.open('Pet removido!', '', { duration: 2500 }); this.load(); });
  }
}