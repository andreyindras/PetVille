import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, Usuario } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'petville_token';
  private readonly USER_KEY  = 'petville_user';

  private _user  = signal<Usuario | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly user          = this._user.asReadonly();
  readonly token         = this._token.asReadonly();
  readonly isAdmin       = computed(() => this._user()?.tipoUsuario === 'ADMIN');
  readonly isCliente     = computed(() => this._user()?.tipoUsuario === 'CLIENTE');
  readonly isAdminOrFunc = computed(() =>
    ['ADMIN', 'FUNCIONARIO'].includes(this._user()?.tipoUsuario ?? '')
  );
  readonly isLoggedIn = computed(() => !!this._token());

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest) {
    return this.http.post<LoginResponse>('/api/auth/login', body).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);

        const user: Usuario = {
          id: res.usuarioId,
          nome: res.nome,
          email: res.email,
          tipoUsuario: res.tipoUsuario,
          clienteId: res.clienteId ?? undefined,
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._token.set(res.token);
        this._user.set(user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadUser(): Usuario | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}