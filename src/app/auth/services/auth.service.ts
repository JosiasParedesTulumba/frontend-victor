import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';

// Interfaces para la API
interface LoginRequest {
    nombre_usuario: string;
    contrasena: string;
}

interface LoginResponse {
    access_token: string;
    usuario: {
        usuario_id: number;
        nombre_usuario: string;
        rol: string;
        nombre_completo: string;
        email: string;
        telefono: string;
        puesto: string;
    };
}

interface Usuario {
    usuario_id: number;
    nombre_usuario: string;
    rol: string;
    nombre_completo: string;
    email: string;
    telefono: string; 
    puesto: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiurl = 'http://localhost:3000/api' // ruta de nestjs
  private currenUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currenUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Verifica si hay token guardado al iniciar
    this.checkStoredToken();
  }

  // Método principal de login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiurl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token y usuario
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('current_user', JSON.stringify(response.usuario));
          localStorage.setItem('isLoggedIn', 'true'); // Mantener compatibilidad
          this.currenUserSubject.next(response.usuario);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          throw error;
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('usuarioActual');
    this.currenUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Obtener usuario actual
  getCurrentUser(): Usuario | null {
    return this.currenUserSubject.value;
  }

  // Verificar roles
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'ADMIN';
  }

  isEmpleado(): boolean {
    const user = this.getCurrentUser();
    return ['ADMIN', 'EMPLEADO'].includes(user?.rol || '');
  }

  isSupervisor(): boolean {
    const user = this.getCurrentUser();
    return ['ADMIN', 'EMPLEADO', 'SUPERVISOR'].includes(user?.rol || '');
  }

  // Headers con token para requests
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Verificar token guardado
  private checkStoredToken(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currenUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

}
