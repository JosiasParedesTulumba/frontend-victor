import { Injectable } from '@angular/core';
import { Pago } from '../interfaces/pago.interface';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private localStorageKey = 'pagos';

  getPagos = (): Pago[] => {
    const pagos = localStorage.getItem(this.localStorageKey);
    return pagos ? JSON.parse(pagos) : [];
  }

  private getNextPagoId = (): string => {
    const pagos = this.getPagos();
    if (pagos.length === 0) return '1';
    const maxId = Math.max(...pagos.map(p => parseInt(p.id || '0', 10) || 0));
    return (maxId + 1).toString();
  }

  addPago = (pago: Pago): void => {
    const pagos = this.getPagos();
    pago.id = this.getNextPagoId();
    pago.fechaPago = new Date().toLocaleString();
    pagos.push(pago);
    localStorage.setItem(this.localStorageKey, JSON.stringify(pagos));
  }

  actualizarPago = (pagoEditado: Pago): void => {
    const pagos = this.getPagos().map(p =>
      p.id === pagoEditado.id ? { ...p, ...pagoEditado } : p
    );
    localStorage.setItem(this.localStorageKey, JSON.stringify(pagos));
  }

  eliminarPago = (index: number): void => {
    const pagos = this.getPagos();
    pagos.splice(index, 1);
    localStorage.setItem(this.localStorageKey, JSON.stringify(pagos));
  }
} 