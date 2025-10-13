import { Injectable } from '@angular/core';
import { Reserva } from '../interfaces/reserva.interface';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private localStorageKey = 'reservas';

  constructor(private vehiculosService: VehiculosService) {}

  getReservas = (): Reserva[] => {
    const reservas = localStorage.getItem(this.localStorageKey);
    return reservas ? JSON.parse(reservas) : [];
  }

  private getNextReservaId = (): string => {
    const reservas = this.getReservas();
    if (reservas.length === 0) return '1001';
    const maxId = Math.max(...reservas.map(r => parseInt(r.id, 10) || 1000));
    return (maxId + 1).toString();
  }

  // addReserva = (reserva: Reserva): void => {
  //   const reservas = this.getReservas();
  //   reserva.id = this.getNextReservaId();
  //   reserva.fechaRegistro = new Date().toLocaleString();
  //   reserva.estado = 'Activa';
  //   reservas.push(reserva);
  //   localStorage.setItem(this.localStorageKey, JSON.stringify(reservas));
  //   // Cambiar estadoActual del vehículo a 'Reservado'
  //   this.vehiculosService.cambiarEstadoActual(reserva.matricula, 'Reservado');
  // }

  // eliminarReserva = (index: number): void => {
  //   const reservas = this.getReservas();
  //   const reserva = reservas[index];
  //   if (reserva && reserva.matricula) {
  //     this.vehiculosService.cambiarEstadoActual(reserva.matricula, 'Disponible');
  //   }
  //   reservas.splice(index, 1);
  //   localStorage.setItem(this.localStorageKey, JSON.stringify(reservas));
  // }

  actualizarReserva = (reservaEditada: Reserva): void => {
    const reservas = this.getReservas().map(r =>
      r.id === reservaEditada.id ? { ...r, ...reservaEditada } : r
    );
    localStorage.setItem(this.localStorageKey, JSON.stringify(reservas));
  }

  getReservaActivaPorDNI = (dni: string): {reserva: Reserva, id: string} | null => {
    const reservas = this.getReservas();
    const reserva = reservas.find(r => r.clienteDNI === dni && r.estado === 'Activa');
    if (reserva) {
      return { reserva, id: reserva.id };
    }
    return null;
  }
} 