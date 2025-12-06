export interface Persona {
  persona_id: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_creacion: Date;
  tipo_persona: number;
  estado_persona: number;
  puesto: string;
}

export interface Vehiculo {
  vehiculo_id: number;
  usuario_id: number;
  modelo: string;
  matricula: string;
  anio: number;
  tipo_vehiculo: number;
  precio: number;
  capacidad: number;
  estado_actual: number;
  estado_vehiculo: number;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface Usuario {
  usuario_id: number;
  username: string;
}

export enum EstadoReserva {
  CANCELADA = 0,
  PENDIENTE = 1,
  CONFIRMADA = 2,
  EN_CURSO = 3,
  COMPLETADA = 4
}

export interface Reserva {
  reserva_id: number;
  vehiculo: Vehiculo;
  persona: Persona;
  usuario: Usuario;
  fecha_reserva: Date;
  fecha_inicio: Date;
  fecha_fin: Date;
  descripcion: string;
  estado_reserva: number; // 1 = Activa, 0 = Cancelada
  pago?: any[];
}