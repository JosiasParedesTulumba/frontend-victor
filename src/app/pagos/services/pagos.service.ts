import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../interfaces/pago.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private apiUrl = 'http://localhost:3000/api/pago';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getPagoById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  addPago(pagoData: any): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pagoData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  actualizarPago(id: number, pagoData: any): Observable<Pago> {
    return this.http.patch<Pago>(`${this.apiUrl}/${id}`, pagoData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  eliminarPago(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 