export interface Pago {
  id?: string;
  clienteDNI: string;
  reservaId?: string;
  monto: number;
  metodoPago: string;
  fechaPago?: string;
} 