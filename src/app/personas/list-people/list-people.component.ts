import { Component, OnInit } from '@angular/core';
import { PersonasService } from '../services/personas.service';
import { Persona } from '../interfaces/persona.interface';

@Component({
  selector: 'app-list-people',
  standalone: false,
  templateUrl: './list-people.component.html',
  styleUrls: ['./list-people.component.css']
})
export class ListPeopleComponent implements OnInit {

  isModalOpen = false;
  mostrarClientes = true;
  isEditModalOpen = false;
  personaEditando: Persona | null = null;

  filtroRol: string = '';
  filtroDniNombre: string = '';

  personas: Persona[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private personasService: PersonasService) { }

  ngOnInit(): void {
    this.cargarPersonas();
  }

  // Cargar personas desde la API
  cargarPersonas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.personasService.getPersonas().subscribe({
      next: (personas) => {
        // Mapear datos de API al formato que usa tu interfaz
        this.personas = personas.map(p => ({
          dni: p.dni || '',
          nombres: p.nombre,
          apellidos: p.apellido,
          direccion: p.direccion,
          telefono: p.telefono,
          correo: p.correo,
          tipoPersona: p.tipo_persona === 1 ? 'Cliente' : 'Empleado',
          // Campos de empleado si aplica
          nombreUsuario: p.usuario?.nombre_usuario || '',
          contrasena: '', // No mostrar contraseña por seguridad
          puesto: p.puesto,
          rol: p.usuario?.rol?.nombre_rol || '',
          fechaRegistro: p.fecha_creacion || '',
          // Campos internos de la API
          persona_id: p.persona_id,
          usuario_id: p.usuario?.usuario_id
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar personas:', error);
        this.errorMessage = 'Error al cargar las personas. Verifique su conexión.';
        this.isLoading = false;
      }
    });
  }

  get clientes(): Persona[] {
    let clientesFiltrados = this.personas.filter(p => p.tipoPersona === 'Cliente');

    if (this.filtroDniNombre) {
      clientesFiltrados = clientesFiltrados.filter(p =>
        (p.dni ?? '').includes(this.filtroDniNombre) ||
        (p.nombres ?? '').toLowerCase().includes(this.filtroDniNombre.toLowerCase()) ||
        (p.apellidos ?? '').toLowerCase().includes(this.filtroDniNombre.toLowerCase())
      );
    }

    return clientesFiltrados;
  }

  get empleados(): Persona[] {
    let empleadosFiltrados = this.personas.filter(p => p.tipoPersona === 'Empleado');

    if (this.filtroRol) {
      empleadosFiltrados = empleadosFiltrados.filter(p =>
        (p.rol ?? '').toLowerCase().includes(this.filtroRol.toLowerCase())
      );
    }

    if (this.filtroDniNombre) {
      empleadosFiltrados = empleadosFiltrados.filter(p =>
        (p.dni ?? '').includes(this.filtroDniNombre) ||
        (p.nombres ?? '').toLowerCase().includes(this.filtroDniNombre.toLowerCase()) ||
        (p.apellidos ?? '').toLowerCase().includes(this.filtroDniNombre.toLowerCase())
      );
    }

    return empleadosFiltrados;
  }

  // Abrir modal para crear nueva persona
  openModal(): void {
    this.isModalOpen = true;
  }

  // Cerrar modal
  closeModal(): void {
    this.isModalOpen = false;
    this.cargarPersonas(); // Recargar lista después de crear
  }

  // Abrir modal de edición
  editarPersona(persona: Persona): void {
    this.personaEditando = { ...persona };
    this.isEditModalOpen = true;
  }

  // Cerrar modal de edición
  cerrarModalEdicion(): void {
    this.isEditModalOpen = false;
    this.personaEditando = null;
    this.cargarPersonas(); // Recargar lista después de editar
  }

  // Eliminar persona
  eliminarPersona(persona: Persona): void {  // Cambiado: ahora recibe el objeto persona completo
    if (confirm(`¿Está seguro de eliminar a ${persona.nombres} ${persona.apellidos}?`)) {
      if (persona.persona_id) {
        this.personasService.eliminarPersona(persona.persona_id).subscribe({
          next: () => {
            this.cargarPersonas(); // Recargar lista
          },
          error: (error) => {
            console.error('Error al eliminar persona:', error);
            alert('Error al eliminar la persona');
          }
        });
      }
    }
  }

  // Métodos para cambiar entre clientes y empleados
  mostrarTablaClientes(): void {
    this.mostrarClientes = true;
  }

  mostrarTablaEmpleados(): void {
    this.mostrarClientes = false;
  }

  
}
