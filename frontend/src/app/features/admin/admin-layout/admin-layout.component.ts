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
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">pets</mat-icon>
          <div>
            <span class="logo-title">PetVille</span>
            <span class="logo-sub">Painel Admin</span>
          </div>
        </div>

        <mat-nav-list class="nav-list">
          @for (item of navItems; track item.path) {
            <a mat-list-item [routerLink]="item.path" routerLinkActive="active-link"
               class="nav-item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info">
            <p class="user-name">{{ auth.user()?.nome }}</p>
            <p class="user-email">{{ auth.user()?.email }}</p>
          </div>
          <button mat-icon-button (click)="auth.logout()" matTooltip="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav {
      width: 240px; background: #1c1917; color: white;
      display: flex; flex-direction: column;
    }
    .sidenav-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 16px; border-bottom: 1px solid #292524;
      .logo-icon { color: #e87d35; font-size: 32px; width: 32px; height: 32px; }
      .logo-title { display: block; font-weight: 700; font-size: 1.1rem; color: white; }
      .logo-sub { display: block; font-size: 0.7rem; color: #78716c; }
    }
    .nav-list { flex: 1; padding: 8px 0; }
    .nav-item {
      color: #a8a29e !important; border-radius: 8px; margin: 2px 8px;
      &.active-link { background: #d4621e !important; color: white !important;
        mat-icon { color: white !important; } }
      mat-icon { color: #a8a29e; }
      &:hover:not(.active-link) { background: #292524 !important; color: white !important; }
    }
    .sidenav-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-top: 1px solid #292524;
      .user-info { min-width: 0; }
      .user-name { font-size: 0.875rem; font-weight: 500; color: #e7e5e4;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
      .user-email { font-size: 0.75rem; color: #78716c;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
      button { color: #78716c; flex-shrink: 0; }
    }
    .main-content { background: #fafaf9; overflow-y: auto; }
  `]
})
export class AdminLayoutComponent {
  navItems = NAV;
  constructor(public auth: AuthService) {}
}