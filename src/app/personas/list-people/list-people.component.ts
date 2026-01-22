import { Component, OnInit } from '@angular/core';
import { PersonasService } from '../services/personas.service';
import { Persona } from '../interfaces/persona.interface';
import { AuthService } from '../../auth/services/auth.service';
import { PermisosService } from '../../auth/services/permisos.service';
import { forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

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

  constructor(
    private personasService: PersonasService,
    private authService: AuthService,
    public permisos: PermisosService
  ) { }

  ngOnInit(): void {
    this.cargarPersonas();
  }

  // Cargar personas desde la API
  cargarPersonas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const personasActivas$ = this.personasService.getPersonas();
    const empleadosInactivos$ = this.permisos.esAdmin()
      ? this.personasService.getEmpleadosInactivos()
      : of([]);

    forkJoin([personasActivas$, empleadosInactivos$]).subscribe({
      next: ([personasActivas, empleadosInactivos]) => {
        const mapPersona = (p: any, estadoForzado?: number): Persona => ({
          dni: p.dni || '',
          nombres: p.nombre,
          apellidos: p.apellido,
          direccion: p.direccion,
          telefono: p.telefono,
          correo: p.correo,
          tipoPersona: p.tipo_persona === 1 ? 'Cliente' : 'Empleado',
          // Campos de empleado si aplica
          nombreUsuario: p.usuario?.nombre_usuario || '',
          contrasena: '',
          puesto: p.puesto,
          rol: p.usuario?.rol?.nombre_rol || '',
          fechaRegistro: p.fecha_creacion || '',
          // Campos internos de la API
          persona_id: p.persona_id,
          usuario_id: p.usuario?.usuario_id,
          estado_persona: estadoForzado ?? p.estado_persona ?? 1,
        });

        const personasMapeadas = personasActivas.map(p => mapPersona(p));
        const inactivosMapeados = (empleadosInactivos || []).map(p => mapPersona(p, 0));

        this.personas = [...personasMapeadas, ...inactivosMapeados];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar personas:', error);
        this.errorMessage = 'Error al cargar las personas. Verifique su conexión.';
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las personas', 'error');
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

    if (!this.permisos.esAdmin()) {
      empleadosFiltrados = empleadosFiltrados.filter(p => p.estado_persona !== 0);
    }

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
    if (!persona.persona_id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas dar de baja a ${persona.nombres} ${persona.apellidos}? Podrás reactivarlo luego.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && persona.persona_id) {
        this.personasService.eliminarPersona(persona.persona_id).subscribe({
          next: () => {
            Swal.fire('¡Actualizado!', 'La persona ha sido dada de baja.', 'success');
            this.cargarPersonas();
          },
          error: (error) => {
            console.error('Error al eliminar persona:', error);
            Swal.fire('Error', 'No se pudo dar de baja la persona', 'error');
          }
        });
      }
    });
  }

  reactivarPersona(persona: Persona): void {
    if (!persona.persona_id) return;

    Swal.fire({
      title: 'Reactivar empleado',
      text: `¿Deseas reactivar a ${persona.nombres} ${persona.apellidos}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.personasService.reactivarPersona(persona.persona_id!).subscribe({
          next: () => {
            Swal.fire('¡Reactivado!', 'La persona ha sido reactivada.', 'success');
            this.cargarPersonas();
          },
          error: (error) => {
            console.error('Error al reactivar persona:', error);
            Swal.fire('Error', 'No se pudo reactivar la persona', 'error');
          }
        });
      }
    });
  }

  // Métodos para cambiar entre clientes y empleados
  mostrarTablaClientes(): void {
    this.mostrarClientes = true;
  }

  mostrarTablaEmpleados(): void {
    this.mostrarClientes = false;
  }

  // Verificar si el usuario puede crear personas (no SUPERVISOR)
  puedeCrearPersona(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol !== 'SUPERVISOR';
  }

  mostrarAcciones(): boolean {
    return !this.permisos.esSupervisor() && !this.permisos.esEmpleado();
  }

}
