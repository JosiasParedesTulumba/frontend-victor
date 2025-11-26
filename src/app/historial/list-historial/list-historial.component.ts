import { Component, OnInit } from '@angular/core';
import { HVehiculo } from '../interfaces/h-vehiculo.interface';
import { HistorialService } from '../services/historial.service';
import { AuthService } from '../../auth/services/auth.service';
import { PermisosService } from '../../auth/services/permisos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-historial',
  standalone: false,
  templateUrl: './list-historial.component.html',
  styleUrl: './list-historial.component.css'
})
export class ListHistorialComponent implements OnInit {
  isModalOpen = false;
  isEditModalOpen = false;
  historiales: HVehiculo[] = [];
  historialToEdit: HVehiculo | null = null;
  loading = false;
  error = '';

  filtroTipoEvento: string = '';
  filtroFechaEvento: string = '';

  constructor(
    private historialService: HistorialService,
    private authService: AuthService,
    public permisos: PermisosService
  ) { }

  ngOnInit() {
    this.loadHistoriales();
  }

  loadHistoriales(): void {
    this.loading = true;
    this.error = '';

    this.historialService.findAll().subscribe({
      next: (historiales) => {
        this.historiales = historiales;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historiales:', error);
        this.error = 'Error al cargar el historial de vehículos';
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el historial de vehículos', 'error');
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSaveHistorial(historialData: any) {
    this.historialService.create(historialData).subscribe({
      next: (nuevoHistorial) => {
        this.historiales.unshift(nuevoHistorial);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error al crear historial:', error);
        this.error = 'Error al crear el historial';
      }
    });
  }

  openEditModal(historial: HVehiculo) {
    this.historialToEdit = historial;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.historialToEdit = null;
  }

  onUpdateHistorial(historialActualizado: HVehiculo) {
    const index = this.historiales.findIndex(h => h.historial_id === historialActualizado.historial_id);
    if (index !== -1) {
      this.historiales[index] = historialActualizado;
    }
    this.closeEditModal();
  }

  // Filtrar historiales
  get historialesFiltrados(): HVehiculo[] {
    let filtered = this.historiales;

    if (this.filtroTipoEvento) {
      filtered = filtered.filter(h =>
        h.tipo_evento.toLowerCase().includes(this.filtroTipoEvento.toLowerCase())
      );
    }

    if (this.filtroFechaEvento) {
      filtered = filtered.filter(h => {
        const fechaEvento = new Date(h.fecha_evento).toISOString().split('T')[0];
        return fechaEvento === this.filtroFechaEvento;
      });
    }

    return filtered;
  }

  // Limpiar filtros
  clearFilters(): void {
    this.filtroTipoEvento = '';
    this.filtroFechaEvento = '';
  }

  // Formatear fecha para mostrar solo la fecha (sin hora)
  formatDate(fecha: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', fecha);
      return 'Fecha inválida';
    }

    return dateObj.toLocaleDateString('es-ES', options);
  }

  // Obtener nombre de usuario para mostrar en la tabla
  getNombreUsuario(historial: any): string {
    if (!historial.usuario) {
      return 'Usuario no disponible';
    }

    const usuario = historial.usuario;

    if (usuario.nombre_usuario) {
      return usuario.nombre_usuario;
    }

    return `Usuario ${usuario.usuario_id || 'sin nombre'}`;
  }

  // Ver detalles del historial
  // verDetalles(historial: HVehiculo): void {
  //   console.log('Ver detalles:', historial);
  //   alert(`Detalles del historial:\nID: ${historial.historial_id}\nVehículo ID: ${historial.vehiculo_id}\nTipo Evento: ${historial.tipo_evento}\nDescripción: ${historial.descripcion}`);
  // }

  // Editar historial
  editarHistorial(historial: HVehiculo): void {
    this.openEditModal(historial);
  }

  // Eliminar historial
  eliminarHistorial(historial: HVehiculo): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este registro de historial? Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.historialService.remove(historial.historial_id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El registro de historial ha sido eliminado.', 'success');
            this.loadHistoriales();
          },
          error: (error) => {
            console.error('Error al eliminar historial:', error);
            this.error = 'Error al eliminar el registro de historial';
            Swal.fire('Error', 'No se pudo eliminar el registro de historial', 'error');
          }
        });
      }
    });
  }

  puedesCrearHistorial(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol !== 'SUPERVISOR';
  }

  mostrarAcciones(): boolean {
    return !this.permisos.esSupervisor();
  }
}
