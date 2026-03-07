import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

const NAV = [
  { path: '/admin/dashboard',    label: 'Dashboard',     icon: 'dashboard' },
  { path: '/admin/agendamentos', label: 'Agendamentos',  icon: 'calendar_today' },
  { path: '/admin/clientes',     label: 'Clientes',      icon: 'people' },
  { path: '/admin/funcionarios', label: 'Funcionários',  icon: 'badge' },
  { path: '/admin/servicos',     label: 'Serviços',      icon: 'content_cut' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="layout-root">
      <!-- ======= SIDEBAR ======= -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-icon-wrap">
            <mat-icon class="logo-icon">pets</mat-icon>
          </div>
          <div class="logo-text-wrap">
            <span class="logo-title">PetVille</span>
            <span class="logo-sub">Painel Admin</span>
          </div>
        </div>

        <nav class="nav-list">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active-link" class="nav-item">
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-avatar">
            {{ auth.user()?.nome?.charAt(0) ?? 'A' }}
          </div>
          <div class="user-info">
            <p class="user-name">{{ auth.user()?.nome }}</p>
            <p class="user-email">{{ auth.user()?.email }}</p>
          </div>
          <button mat-icon-button class="logout-btn" (click)="auth.logout()" matTooltip="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- ======= MAIN CONTENT ======= -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    /* ---- Layout root ---- */
    .layout-root {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ---- Sidebar ---- */
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: #1c1917;
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      flex-shrink: 0;
    }

    /* ---- Sidebar header ---- */
    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .logo-icon-wrap {
      width: 40px;
      height: 40px;
      background: #d4621e;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-icon { color: white; font-size: 22px; width: 22px; height: 22px; }
    .logo-text-wrap { display: flex; flex-direction: column; min-width: 0; }
    .logo-title { font-weight: 700; font-size: 1rem; color: white; line-height: 1.2; }
    .logo-sub   { font-size: 0.7rem; color: #78716c; line-height: 1.2; }

    /* ---- Nav list ---- */
    .nav-list {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      text-decoration: none;
      color: #a8a29e;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
      cursor: pointer;
      white-space: nowrap;
    }
    .nav-item:hover:not(.active-link) {
      background: rgba(255,255,255,0.06);
      color: #e7e5e4;
    }
    .nav-item.active-link {
      background: #d4621e;
      color: white;
    }
    .nav-item.active-link .nav-icon {
      color: white;
    }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #78716c;
      flex-shrink: 0;
    }
    .nav-label {
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1;
    }

    /* ---- Sidebar footer ---- */
    .sidebar-footer {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      background: #d4621e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }
    .user-info { flex: 1; min-width: 0; }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: #e7e5e4;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 0.7rem;
      color: #78716c;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .logout-btn {
      color: #78716c !important;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    .logout-btn:hover { color: #e7e5e4 !important; }

    /* ---- Main content ---- */
    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #fafaf9;
    }

    /* ---- Page content spacing (shared across admin pages) ---- */
    :host ::ng-deep .page-container {
      padding: 32px 36px;
      max-width: 1200px;
    }
    :host ::ng-deep .page-header {
      margin-bottom: 28px;
    }
    :host ::ng-deep .page-header h1 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #1c1917;
      margin: 0 0 4px;
    }
    :host ::ng-deep .page-header p {
      color: #78716c;
      font-size: 0.875rem;
      margin: 0;
    }
    :host ::ng-deep .card-table {
      background: white;
      border-radius: 16px;
      border: 1px solid #e7e5e4;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    :host ::ng-deep .toolbar-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #f5f5f4;
      flex-wrap: wrap;
    }
    :host ::ng-deep .search-field { flex: 1; min-width: 200px; }
    :host ::ng-deep table { width: 100%; }
    :host ::ng-deep .mat-mdc-header-row { background: #fafaf9; }
    :host ::ng-deep .mat-mdc-header-cell {
      font-size: 0.75rem;
      font-weight: 600;
      color: #78716c;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 12px 16px;
      border-bottom: 1px solid #f0ede9;
    }
    :host ::ng-deep .mat-mdc-cell {
      font-size: 0.875rem;
      color: #1c1917;
      padding: 14px 16px;
      border-bottom: 1px solid #f5f5f4;
    }
    :host ::ng-deep .mat-mdc-row:last-child .mat-mdc-cell { border-bottom: none; }
    :host ::ng-deep .mat-mdc-row:hover { background: #fafaf9; }
    :host ::ng-deep .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 56px 32px;
      color: #a8a29e;
      gap: 8px;
    }
    :host ::ng-deep .empty-state mat-icon {
      font-size: 40px; width: 40px; height: 40px; opacity: 0.4;
    }
    :host ::ng-deep .empty-state p { margin: 0; font-size: 0.9rem; }
    :host ::ng-deep .status-chip {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    :host ::ng-deep .status-chip.PENDENTE     { background:#fef9c3; color:#854d0e; }
    :host ::ng-deep .status-chip.CONFIRMADO   { background:#dbeafe; color:#1e40af; }
    :host ::ng-deep .status-chip.EM_ANDAMENTO { background:#fde68a; color:#92400e; }
    :host ::ng-deep .status-chip.CONCLUIDO    { background:#dcfce7; color:#166534; }
    :host ::ng-deep .status-chip.CANCELADO    { background:#fee2e2; color:#991b1b; }
    :host ::ng-deep .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  `]
})
export class AdminLayoutComponent {
  navItems = NAV;
  constructor(public auth: AuthService) {}
}