import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

const NAV = [
  { path: '/admin/dashboard',    label: 'Dashboard',     icon: 'dashboard',      description: 'Visão geral' },
  { path: '/admin/agendamentos', label: 'Agendamentos',  icon: 'calendar_today', description: 'Gerenciar agenda' },
  { path: '/admin/clientes',     label: 'Clientes',      icon: 'people',         description: 'Base de clientes' },
  { path: '/admin/funcionarios', label: 'Funcionários',  icon: 'badge',          description: 'Equipe' },
  { path: '/admin/servicos',     label: 'Serviços',      icon: 'content_cut',    description: 'Catálogo de serviços' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="layout-root">

      <!-- ======= SIDEBAR ======= -->
      <aside class="sidebar" role="navigation" aria-label="Menu lateral">

        <div class="sidebar-brand">
          <div class="brand-icon"><mat-icon>pets</mat-icon></div>
          <div class="brand-text">
            <span class="brand-name">PetVille</span>
            <span class="brand-role">Administração</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="nav-active"
               class="nav-item"
               [matTooltip]="item.description"
               matTooltipPosition="right">
              <span class="nav-icon-wrap">
                <mat-icon>{{ item.icon }}</mat-icon>
              </span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-pill">
            <div class="user-avatar">
              {{ auth.user()?.nome?.charAt(0)?.toUpperCase() ?? 'A' }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ auth.user()?.nome }}</span>
              <span class="user-email">{{ auth.user()?.email }}</span>
            </div>
            <button class="logout-btn" (click)="auth.logout()" matTooltip="Sair" matTooltipPosition="right" aria-label="Sair">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- ======= MAIN ======= -->
      <div class="main-wrapper">

        <!-- Top Bar -->
        <header class="top-bar">
          <div class="breadcrumb">
            <span class="bc-root">PetVille</span>
            <mat-icon class="bc-sep">chevron_right</mat-icon>
            <span class="bc-current">{{ currentPageLabel }}</span>
          </div>
          <span class="date-chip">{{ today | date:"EEE, d MMM":"":"pt-BR" }}</span>
        </header>

        <!-- Content -->
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-root {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--pv-50, #fafaf9);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 232px;
      min-width: 232px;
      flex-shrink: 0;
      background: #1c1917;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .brand-icon {
      width: 36px; height: 36px; min-width: 36px;
      background: #d4621e;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 8px rgba(212,98,30,0.4);
      mat-icon { color: white; font-size: 19px; width: 19px; height: 19px; }
    }

    .brand-text { display: flex; flex-direction: column; min-width: 0; }
    .brand-name { font-weight: 700; font-size: 0.92rem; color: white; letter-spacing: -0.01em; line-height: 1.25; }
    .brand-role { font-size: 0.65rem; color: rgba(255,255,255,0.32); letter-spacing: 0.05em; text-transform: uppercase; }

    .sidebar-nav {
      flex: 1;
      padding: 10px 7px;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .nav-item {
      display: flex; align-items: center; gap: 9px;
      padding: 8px 9px;
      border-radius: 8px;
      text-decoration: none;
      color: rgba(255,255,255,0.48);
      font-size: 0.835rem;
      font-weight: 500;
      transition: background 0.12s, color 0.12s;
      cursor: pointer;
    }

    .nav-item:hover:not(.nav-active) {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.82);
    }

    .nav-item.nav-active {
      background: #d4621e;
      color: white;
      box-shadow: 0 2px 8px rgba(212,98,30,0.35);
      .nav-icon-wrap mat-icon { color: white; }
    }

    .nav-icon-wrap {
      display: flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; flex-shrink: 0;
      mat-icon { font-size: 17px; width: 17px; height: 17px; color: rgba(255,255,255,0.42); transition: color 0.12s; }
    }

    .nav-label { font-size: 0.835rem; font-weight: 500; white-space: nowrap; }

    /* Footer */
    .sidebar-footer {
      padding: 8px 7px 12px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .user-pill {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 8px;
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
    }

    .user-avatar {
      width: 30px; height: 30px; min-width: 30px;
      background: #d4621e; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.78rem; color: white;
    }

    .user-meta {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column;
    }

    .user-name {
      font-size: 0.76rem; font-weight: 600; color: rgba(255,255,255,0.82);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
    }

    .user-email {
      font-size: 0.65rem; color: rgba(255,255,255,0.3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
    }

    .logout-btn {
      width: 26px; height: 26px; min-width: 26px;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.28);
      transition: color 0.12s, background 0.12s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.1); }
    }

    /* ── Main Wrapper ── */
    .main-wrapper {
      flex: 1; display: flex; flex-direction: column;
      overflow: hidden; min-width: 0;
    }

    /* ── Top Bar ── */
    .top-bar {
      height: 50px; min-height: 50px;
      background: white;
      border-bottom: 1px solid #e7e5e4;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px; gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,.04);
      z-index: 5;
    }

    .breadcrumb { display: flex; align-items: center; gap: 2px; }
    .bc-root { font-size: 0.78rem; color: #a8a29e; font-weight: 500; }
    .bc-sep { font-size: 15px !important; width: 15px !important; height: 15px !important; color: #d6d3d1; }
    .bc-current { font-size: 0.78rem; font-weight: 600; color: #44403c; }

    .date-chip {
      font-size: 0.75rem;
      color: #a8a29e;
      background: #f5f5f4;
      padding: 4px 10px;
      border-radius: 999px;
      text-transform: capitalize;
    }

    /* ── Main Content ── */
    .main-content { flex: 1; overflow-y: auto; overflow-x: hidden; }

    /* ── Shared child styles ── */
    :host ::ng-deep .page-container {
      padding: 28px 32px;
    }

    :host ::ng-deep .page-header {
      margin-bottom: 24px;
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; flex-wrap: wrap;
      h1 { font-size: 1.45rem; font-weight: 700; color: #1c1917; margin: 0 0 3px; letter-spacing: -0.02em; }
      p { color: #78716c; font-size: 0.845rem; margin: 0; }
    }

    :host ::ng-deep .card-table {
      background: white; border-radius: 16px;
      border: 1px solid #e7e5e4;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      overflow: hidden;
    }

    :host ::ng-deep .toolbar-row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 18px; border-bottom: 1px solid #f5f5f4;
      flex-wrap: wrap; background: white;
    }

    :host ::ng-deep .search-field { flex: 1; min-width: 200px; }
    :host ::ng-deep table { width: 100%; }
    :host ::ng-deep .mat-mdc-header-row { background: #fafaf9 !important; }
    :host ::ng-deep .mat-mdc-header-cell {
      font-size: 0.7rem !important; font-weight: 700 !important;
      color: #78716c !important; text-transform: uppercase; letter-spacing: 0.06em !important;
      padding: 11px 16px !important; border-bottom: 1px solid #e7e5e4 !important;
    }
    :host ::ng-deep .mat-mdc-cell {
      font-size: 0.875rem !important; color: #1c1917 !important;
      padding: 13px 16px !important; border-bottom: 1px solid #f5f5f4 !important;
    }
    :host ::ng-deep .mat-mdc-row:last-child .mat-mdc-cell { border-bottom: none !important; }
    :host ::ng-deep .mat-mdc-row:hover { background: #fafaf9 !important; }
    :host ::ng-deep .mat-column-acoes { width: 148px; text-align: right !important; padding-right: 12px !important; }

    :host ::ng-deep .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 52px 32px; color: #a8a29e; gap: 8px; text-align: center;
      mat-icon { font-size: 38px; width: 38px; height: 38px; opacity: 0.3; }
      p { margin: 0; font-size: 0.875rem; }
    }

    :host ::ng-deep .status-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 999px;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.01em; white-space: nowrap;
      &::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.6; flex-shrink: 0; }
      &.PENDENTE     { background: #fef9c3; color: #854d0e; }
      &.CONFIRMADO   { background: #dbeafe; color: #1e40af; }
      &.EM_ANDAMENTO { background: #fde68a; color: #92400e; }
      &.CONCLUIDO    { background: #dcfce7; color: #166534; }
      &.CANCELADO    { background: #fee2e2; color: #991b1b; }
    }

    :host ::ng-deep .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    :host ::ng-deep .error-box {
      display: flex; align-items: flex-start; gap: 8px;
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 14px;
    }

    :host ::ng-deep .pagination-row {
      display: flex; align-items: center; justify-content: flex-end;
      gap: 6px; padding: 10px 16px; border-top: 1px solid #f5f5f4;
      font-size: 0.8rem; color: #78716c;
      .page-info { margin-right: 6px; }
      button {
        width: 30px; height: 30px; border: 1px solid #e7e5e4; background: white;
        border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center;
        justify-content: center; color: #44403c; transition: all 0.12s;
        font-size: 0.78rem; font-family: inherit;
        &:hover:not(:disabled) { background: #fafaf9; border-color: #d6d3d1; }
        &:disabled { opacity: 0.35; cursor: not-allowed; }
        &.active { background: #d4621e; border-color: #d4621e; color: white; }
      }
    }
  `]
})
export class AdminLayoutComponent {
  navItems = NAV;
  today = new Date();
  currentPageLabel = 'Dashboard';

  constructor(public auth: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        const url = this.router.url;
        const match = NAV.find(n => url.includes(n.path.split('/').pop()!));
        return match?.label ?? 'Dashboard';
      })
    ).subscribe(label => this.currentPageLabel = label);

    const url = this.router.url;
    const match = NAV.find(n => url.includes(n.path.split('/').pop()!));
    this.currentPageLabel = match?.label ?? 'Dashboard';
  }
}