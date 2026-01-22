import { Injectable } from '@angular/core';
import { Persona } from '../interfaces/persona.interface';
import { AuthService } from '../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private apiUrl = 'http://localhost:3000/api/persona';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Obtener todas las personas
  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Obtener solo clientes
  getClientes(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/clientes`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Obtener solo empleados
  getEmpleados(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/empleados`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Obtener empleados inactivos (solo admins)
  getEmpleadosInactivos(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/empleados/inactivos`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Crear persona (cliente o empleado)
  addPersona(persona: any): Observable<Persona> {
    return this.http.post<Persona>(`${this.apiUrl}`, persona, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Actualizar persona
  actualizarPersona(id: number, persona: any): Observable<Persona> {
    return this.http.patch<Persona>(`${this.apiUrl}/${id}`, persona, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Eliminar persona
  eliminarPersona(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Reactivar persona
  reactivarPersona(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reactivar`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Obtener estadísticas
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Método para mantener compatibilidad (ya no se usa para login)
  validarCredenciales(nombreUsuario: string, contrasena: string): null {
    // Este método ya no se usa, el login se maneja por AuthService
    console.log('validarCredenciales deprecated - usar AuthService.login()');
    return null;
  }

} 