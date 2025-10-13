import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Observable } from 'rxjs';
import { CreateHVehiculoDto, HVehiculo, UpdateHVehiculoDto } from '../interfaces/h-vehiculo.interface';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  private apiUrl = 'http://localhost:3000/api/h-vehiculo';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Obtener todos los registros de historial
  findAll(): Observable<HVehiculo[]> {
    return this.http.get<HVehiculo[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Obtener un registro por ID
  findOne(id: number): Observable<HVehiculo> {
    return this.http.get<HVehiculo>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Crear nuevo registro
  create(createHVehiculoDto: CreateHVehiculoDto): Observable<HVehiculo> {
    return this.http.post<HVehiculo>(this.apiUrl, createHVehiculoDto, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Actualizar registro
  update(id: number, updateHVehiculoDto: UpdateHVehiculoDto): Observable<HVehiculo> {
    return this.http.patch<HVehiculo>(`${this.apiUrl}/${id}`, updateHVehiculoDto, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Eliminar registro (eliminación lógica)
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Obtener historial por vehículo
  findByVehiculo(vehiculoId: number): Observable<HVehiculo[]> {
    return this.http.get<HVehiculo[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
