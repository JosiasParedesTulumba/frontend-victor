export interface Persona {
  // Campos principales (tu interfaz original)
  dni?: string;
  nombres?: string;
  apellidos?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  tipoPersona?: 'Cliente' | 'Empleado';

  // Campos de empleado
  nombreUsuario?: string;
  contrasena?: string;
  puesto?: string;
  rol?: string;
  fechaRegistro?: string;

  // Campos de la API (agregar estos)
  persona_id?: number;
  nombre?: string;        // Campo de API
  apellido?: string;      // Campo de API
  tipo_persona?: number;  // Campo de API
  estado_persona?: number;
  fecha_creacion?: string;
  usuario_id?: number;

  // Usuario relacionado
  usuario?: {
    usuario_id: number;
    nombre_usuario: string;
    contrasena?: string;
    rol: {
      rol_id: number;
      nombre_rol: string;
    };
  };
}