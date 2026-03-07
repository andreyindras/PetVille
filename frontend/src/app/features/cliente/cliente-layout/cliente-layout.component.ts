import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

const NAV = [
  { path: '/cliente/agendamentos',     label: 'Agendamentos',  icon: 'calendar_today' },
  { path: '/cliente/novo-agendamento', label: 'Agendar',       icon: 'add_circle' },
  { path: '/cliente/pets',             label: 'Meus Pets',     icon: 'pets' },
  { path: '/cliente/perfil',           label: 'Meu Perfil',    icon: 'person' },
];

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatTabsModule,
    MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="layout">
      <mat-toolbar class="toolbar" color="primary">
        <mat-icon class="logo-icon">pets</mat-icon>
        <span class="logo-text">PetVille</span>

        <nav class="nav-links">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active-nav"
               class="nav-link">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <span class="spacer"></span>
        <span class="user-name">{{ auth.user()?.nome?.split(' ')[0] }}</span>
        <button mat-icon-button (click)="auth.logout()" matTooltip="Sair">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; flex-direction: column; min-height: 100vh; }
    .toolbar {
      background: white !important; color: #1c1917 !important;
      border-bottom: 1px solid #e7e5e4; position: sticky; top: 0; z-index: 10;
      gap: 8px;
      .logo-icon { color: #d4621e; }
      .logo-text { font-weight: 700; font-size: 1.1rem; margin-right: 24px; }
    }
    .nav-links { display: flex; gap: 4px; }
    .nav-link {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; text-decoration: none;
      color: #78716c; font-size: 0.875rem; font-weight: 500;
      transition: all 0.15s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: #f5f5f4; color: #1c1917; }
      &.active-nav { background: #fdf4ee; color: #d4621e; }
    }
    .spacer { flex: 1; }
    .user-name { font-size: 0.875rem; color: #78716c; margin-right: 4px; }
    .main { flex: 1; max-width: 960px; width: 100%; margin: 0 auto; padding: 32px 16px; }
  `]
})
export class ClienteLayoutComponent {
  navItems = NAV;
  constructor(public auth: AuthService) {}
}