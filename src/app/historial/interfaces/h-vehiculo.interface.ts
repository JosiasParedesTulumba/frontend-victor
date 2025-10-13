export interface HVehiculo {
    historial_id: number;
    vehiculo_id: number;
    usuario_id: number;
    fecha_evento: Date;
    descripcion?: string;
    tipo_evento: string;
    estado: boolean;
    // Relaciones (opcionales para cuando incluyas los datos del vehículo y usuario)
    vehiculo?: any;
    usuario?: any;
}

export interface CreateHVehiculoDto {
    vehiculo_id: number;
    usuario_id: number;
    fecha_evento?: Date;
    descripcion?: string;
    tipo_evento: string;
}

export interface UpdateHVehiculoDto {
    vehiculo_id?: number;
    usuario_id?: number;
    fecha_evento?: Date;
    descripcion?: string;
    tipo_evento?: string;
}
