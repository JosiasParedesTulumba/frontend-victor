import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Observable } from 'rxjs';

export interface Rol {
  rol_id: number;
  nombre_rol: string;
  estado_rol: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:3000/api/rol'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  findAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
