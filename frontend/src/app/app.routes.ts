import { Routes } from '@angular/router';
import { adminGuard, clienteGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'agendamentos', loadComponent: () => import('./features/admin/agendamentos/agendamentos.component').then(m => m.AgendamentosComponent) },
      { path: 'clientes',     loadComponent: () => import('./features/admin/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'funcionarios', loadComponent: () => import('./features/admin/funcionarios/funcionarios.component').then(m => m.FuncionariosComponent) },
      { path: 'servicos',     loadComponent: () => import('./features/admin/servicos/servicos.component').then(m => m.ServicosComponent) },
    ]
  },

  {
    path: 'cliente',
    loadComponent: () => import('./features/cliente/cliente-layout/cliente-layout.component').then(m => m.ClienteLayoutComponent),
    canActivate: [clienteGuard],
    children: [
      { path: '', redirectTo: 'agendamentos', pathMatch: 'full' },
      { path: 'agendamentos',     loadComponent: () => import('./features/cliente/agendamentos/agendamentos.component').then(m => m.AgendamentosClienteComponent) },
      { path: 'novo-agendamento', loadComponent: () => import('./features/cliente/novo-agendamento/novo-agendamento.component').then(m => m.NovoAgendamentoComponent) },
      { path: 'pets',             loadComponent: () => import('./features/cliente/pets/pets.component').then(m => m.PetsComponent) },
      { path: 'perfil',           loadComponent: () => import('./features/cliente/perfil/perfil.component').then(m => m.PerfilComponent) },
    ]
  },

  { path: '**', redirectTo: 'login' }
];