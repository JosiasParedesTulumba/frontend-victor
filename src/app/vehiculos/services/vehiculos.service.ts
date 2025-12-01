import { Injectable } from '@angular/core';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {

  private apiUrl = 'http://localhost:3000/api/vehiculo';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Obtener todos los vehículos
  getVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(vehiculos => vehiculos.map(v => this.mapearVehiculoDesdeAPI(v)))
    );
  }

  // Obtener solo disponibles
  getVehiculosDisponibles(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/estado/disponibles`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(vehiculos => vehiculos.map(v => this.mapearVehiculoDesdeAPI(v)))
    );
  }

  // Obtener por tipo
  getVehiculosPorTipo(tipo: number): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/tipo/${tipo}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(vehiculos => vehiculos.map(v => this.mapearVehiculoDesdeAPI(v)))
    );
  }

  // Obtener estadísticas
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas/general`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Crear vehículo
  addVehiculo(vehiculo: any): Observable<Vehiculo> {
    const vehiculoAPI = this.mapearVehiculoParaAPI(vehiculo);
    return this.http.post<Vehiculo>(`${this.apiUrl}`, vehiculoAPI, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Actualizar vehículo
  actualizarVehiculo(vehiculo_id: number, vehiculo: any): Observable<Vehiculo> {
    const vehiculoAPI = this.mapearVehiculoParaAPI(vehiculo, true);
    return this.http.patch<Vehiculo>(`${this.apiUrl}/${vehiculo_id}`, vehiculoAPI, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Eliminar vehículo
  eliminarVehiculo(vehiculo_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${vehiculo_id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Cambiar estado del vehículo
  cambiarEstadoActual(vehiculo_id: number, estado_vehiculo: number): Observable<Vehiculo> {
    return this.http.patch<Vehiculo>(`${this.apiUrl}/${vehiculo_id}/estado`,
      { estado_vehiculo },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // Mapear de API a Frontend
  private mapearVehiculoDesdeAPI(v: any): Vehiculo {
    return {
      vehiculo_id: v.vehiculo_id,
      modelo: v.modelo,
      matricula: v.matricula,
      anio: v.anio,
      tipo: this.obtenerNombreTipo(v.tipo_vehiculo),
      tipo_vehiculo: v.tipo_vehiculo,
      precio: v.precio,
      capacidad: v.capacidad,
      fechaRegistro: v.fecha_creacion,
      estadoActual: this.mapearEstadoVehiculo(v.estado_vehiculo),
      estado: v.estado_actual === 1 ? 'Activo' : 'Inactivo',
      estado_actual: v.estado_actual,
      estado_vehiculo: v.estado_vehiculo,
      usuario_id: v.usuario_id
    };
  }

  // Mapear de Frontend a API
  private mapearVehiculoParaAPI(vehiculo: any, esActualizacion = false): any {
    const usuarioActual = this.authService.getCurrentUser();

    const datos: any = {
      modelo: vehiculo.modelo,
      matricula: vehiculo.matricula,
      anio: parseInt(vehiculo.anio),
      tipo_vehiculo: this.obtenerTipoVehiculoNumero(vehiculo.tipo),
      precio: parseFloat(vehiculo.precio),
      capacidad: parseInt(vehiculo.capacidad)
    };

    // Solo agregar usuario_id al crear
    if (!esActualizacion) {
      datos.usuario_id = usuarioActual?.usuario_id || 1;
    }

    return datos;
  }

  // Mapear número de tipo a nombre
  private obtenerNombreTipo(tipo: number): string {
    const tipos: { [key: number]: string } = {
      1: 'Sedan',
      2: 'SUV',
      3: 'Camioneta',
      4: 'Van'
    };
    return tipos[tipo] || 'Otro';
  }

  // Mapear nombre de tipo a número
  private obtenerTipoVehiculoNumero(tipo: string): number {
    const tipos: { [key: string]: number } = {
      'Sedan': 1,
      'SUV': 2,
      'Camioneta': 3,
      'Van': 4
    };
    return tipos[tipo] || 1;
  }

  // Mapear estado numérico a texto
  private mapearEstadoVehiculo(estado: number): 'Disponible' | 'Reservado' | 'Ocupado' {
    const estados: { [key: number]: 'Disponible' | 'Reservado' | 'Ocupado' } = {
      1: 'Ocupado',
      2: 'Reservado',
      3: 'Disponible'
    };
    return estados[estado] || 'Disponible';
  }

  getMatriculas(): Observable<{ vehiculo_id: number, matricula: string }[]> {
    return this.http.get<{ vehiculo_id: number, matricula: string }[]>(
      `${this.apiUrl}/matriculas/lista`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}