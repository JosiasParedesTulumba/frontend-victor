import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../interfaces/reserva.interface';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private apiUrl = 'http://localhost:3000/api/reserva';

  constructor(
    private http: HttpClient,
    private vehiculosService: VehiculosService,
    private authService: AuthService
  ) { }

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createReserva(reservaData: any): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reservaData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/${id}/cancelar`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  actualizarReserva(id: number, reservaData: any): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reservaData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getReservasByVehiculo(vehiculoId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  confirmarReserva(reservaId: number): Observable<Reserva> {
    return this.http.patch<Reserva>(
      `${this.apiUrl}/${reservaId}/confirmar`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas/globales`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getReservasPorEstado(estado: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/estado/${estado}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}