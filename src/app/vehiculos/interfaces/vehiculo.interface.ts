export interface Vehiculo {
  // Campos del frontend (tu interfaz original)
  modelo?: string;
  matricula?: string;
  anio?: number;
  tipo?: string;
  precio?: number;
  capacidad?: number;
  fechaRegistro?: string;
  estadoActual?: 'Disponible' | 'Reservado' | 'Mantenimiento';
  estado?: 'Activo' | 'Inactivo';

  // Campos de la API
  vehiculo_id?: number;
  usuario_id?: number;
  tipo_vehiculo?: number;
  estado_actual?: number;
  estado_vehiculo?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}