import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

const NAV = [
  { path: '/cliente/agendamentos', label: 'Agendamentos', icon: 'calendar_today' },
  { path: '/cliente/pets',         label: 'Meus Pets',    icon: 'pets' },
  { path: '/cliente/perfil',       label: 'Meu Perfil',   icon: 'person' },
];

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="layout">

      <!-- ── Top Navbar ── -->
      <header class="navbar">
        <div class="navbar-inner">

          <a routerLink="/cliente/agendamentos" class="brand" aria-label="PetVille - Início">
            <div class="brand-icon"><mat-icon>pets</mat-icon></div>
            <span class="brand-name">PetVille</span>
          </a>

          <nav class="nav-links">
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="nav-active" class="nav-link">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>

          <div class="navbar-right">
            <a routerLink="/cliente/novo-agendamento" routerLinkActive="cta-active" class="cta-btn">
              <mat-icon>add</mat-icon>
              <span class="cta-text">Agendar</span>
            </a>

            <div class="user-chip" (click)="auth.logout()" role="button" tabindex="0"
                 matTooltip="Clique para sair" aria-label="Sair da conta">
              <div class="user-avatar">{{ firstName.charAt(0) }}</div>
              <span class="user-name-text">{{ firstName }}</span>
              <mat-icon class="user-logout-icon">logout</mat-icon>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Mobile Bottom Nav ── -->
      <nav class="bottom-nav" aria-label="Menu mobile">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bottom-active" class="bottom-item">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
        <a routerLink="/cliente/novo-agendamento" routerLinkActive="bottom-active" class="bottom-item bottom-cta">
          <mat-icon>add_circle</mat-icon>
          <span>Agendar</span>
        </a>
      </nav>

      <!-- ── Content ── -->
      <main class="main">
        <div class="main-inner">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Zera qualquer margin/padding herdado */
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: #fafaf9;
    }

    .navbar {
      background: white;
      border-bottom: 1px solid #e7e5e4;
      flex-shrink: 0;          /* nunca encolhe */
      height: 58px;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,.04);
    }

    .navbar-inner {
      max-width: 1080px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 0;
    }

    .brand {
      display: flex; align-items: center; gap: 8px;
      text-decoration: none; margin-right: 32px; flex-shrink: 0;
    }
    .brand-icon {
      width: 32px; height: 32px; background: #d4621e;
      border-radius: 9px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(212,98,30,.3);
      mat-icon { color: white; font-size: 17px; width: 17px; height: 17px; }
    }
    .brand-name { font-weight: 700; font-size: 1rem; color: #1c1917; letter-spacing: -0.02em; }

    .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
    .nav-link {
      display: flex; align-items: center; gap: 6px; padding: 6px 11px;
      border-radius: 8px; text-decoration: none; color: #78716c;
      font-size: 0.845rem; font-weight: 500;
      transition: background 0.12s, color 0.12s; white-space: nowrap;
      &:hover:not(.nav-active) { background: #f5f5f4; color: #1c1917; }
    }
    .nav-link.nav-active { background: #fdf4ee; color: #d4621e; .nav-icon { color: #d4621e; } }
    .nav-icon { font-size: 17px; width: 17px; height: 17px; color: #a8a29e; transition: color 0.12s; }

    .navbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }

    .cta-btn {
      display: flex; align-items: center; gap: 5px; padding: 7px 14px;
      background: #d4621e; color: white; border-radius: 9px;
      text-decoration: none; font-size: 0.845rem; font-weight: 600;
      transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
      box-shadow: 0 2px 8px rgba(212,98,30,.3); white-space: nowrap;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &:hover { background: #b85319; box-shadow: 0 4px 12px rgba(212,98,30,.4); transform: translateY(-1px); }
      &.cta-active { background: #b85319; }
    }

    .user-chip {
      display: flex; align-items: center; gap: 7px;
      padding: 5px 10px 5px 5px; border-radius: 999px;
      background: #f5f5f4; border: 1px solid #e7e5e4;
      cursor: pointer; transition: all 0.12s; user-select: none;
      &:hover {
        background: #fee2e2; border-color: #fca5a5;
        .user-logout-icon, .user-name-text { color: #991b1b; }
        .user-avatar { background: #dc2626; }
      }
    }
    .user-avatar {
      width: 26px; height: 26px; background: #d4621e; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.75rem; color: white; transition: background 0.12s;
    }
    .user-name-text { font-size: 0.8rem; font-weight: 600; color: #44403c; transition: color 0.12s; }
    .user-logout-icon {
      font-size: 14px !important; width: 14px !important; height: 14px !important;
      color: #a8a29e; transition: color 0.12s;
    }

    .main {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .main-inner {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 40px;
    }

    .bottom-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0;
      background: white; border-top: 1px solid #e7e5e4; z-index: 100;
      box-shadow: 0 -2px 10px rgba(0,0,0,.08);
      padding: 0 8px env(safe-area-inset-bottom, 0);
    }
    .bottom-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px; padding: 10px 4px;
      text-decoration: none; color: #a8a29e; font-size: 0.65rem;
      font-weight: 500; transition: color 0.12s; border-top: 2px solid transparent;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &.bottom-active { color: #d4621e; border-top-color: #d4621e; }
    }
    .bottom-cta { color: #d4621e; mat-icon { color: #d4621e; } }

    :host ::ng-deep .page-header {
      margin-bottom: 24px;
      h1 { font-size: 1.4rem; font-weight: 700; color: #1c1917; margin: 0 0 3px; letter-spacing: -0.02em; }
      p { color: #78716c; font-size: 0.845rem; margin: 0; }
    }

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .cta-text, .user-name-text { display: none; }
      .bottom-nav { display: flex; }
      .main-inner { padding-bottom: 80px; }
      .navbar-inner { padding: 0 14px; }
    }
    @media (max-width: 420px) {
      .brand-name { display: none; }
    }
  `]
})
export class ClienteLayoutComponent {
  navItems = NAV;

  get firstName(): string {
    const nome = this.auth.user()?.nome;
    return nome ? nome.split(' ')[0] : '';
  }

  constructor(public auth: AuthService) {}
}