import { Reserva } from '../../reservas/interfaces/reserva.interface';

export interface Pago {
  pago_id?: number;
  reserva: Reserva;
  usuario_id: number;
  fecha_pago: Date | string;
  monto: string;
  metodo_pago: number;
  estado_pago: number;
  monto_ajuste?: string;
} 