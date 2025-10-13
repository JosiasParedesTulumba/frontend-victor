export interface Reserva {
  id: string;
  clienteDNI: string;
  matricula: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  fechaRegistro?: string;
  estado?: 'Activa' | 'Finalizada' | 'Cancelada';
} 