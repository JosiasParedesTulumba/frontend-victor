import { Component, OnInit } from '@angular/core';
import { HVehiculo } from '../interfaces/h-vehiculo.interface';
import { HistorialService } from '../services/historial.service';

@Component({
  selector: 'app-list-historial',
  standalone: false,
  templateUrl: './list-historial.component.html',
  styleUrl: './list-historial.component.css'
})
export class ListHistorialComponent implements OnInit {
  isModalOpen = false;
  historiales: HVehiculo[] = [];
  loading = false;
  error = '';

  filtroTipoEvento: string = '';
  filtroFechaEvento: string = '';

  constructor(private historialService: HistorialService) { }

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
    
    // Si ya es un objeto Date, lo usamos directamente
    const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    // Verificamos si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', fecha);
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', options);
  }

  // Obtener nombre de usuario para mostrar en la tabla
  getNombreUsuario(historial: any): string {
    // Si no hay usuario, retornar mensaje
    if (!historial.usuario) {
      return 'Usuario no disponible';
    }

    const usuario = historial.usuario;
    
    // Usar la propiedad nombre_usuario que vimos en la consola
    if (usuario.nombre_usuario) {
      return usuario.nombre_usuario;
    }
    
    // Si por alguna razón no está, mostrar el ID
    return `Usuario ${usuario.usuario_id || 'sin nombre'}`;
  }

  // Ver detalles del historial
  verDetalles(historial: HVehiculo): void {
    // Aquí puedes implementar un modal de detalles o navegación
    console.log('Ver detalles:', historial);
    alert(`Detalles del historial:\nID: ${historial.historial_id}\nVehículo ID: ${historial.vehiculo_id}\nTipo Evento: ${historial.tipo_evento}\nDescripción: ${historial.descripcion}`);
  }

  // Editar historial
  editarHistorial(historial: HVehiculo): void {
    // Aquí puedes implementar la lógica para editar el historial
    // Por ejemplo, abrir un modal de edición
    console.log('Editando historial:', historial);
  }

  // Eliminar historial
  eliminarHistorial(historial: HVehiculo): void {
    if (confirm('¿Está seguro de que desea eliminar este registro de historial?')) {
      this.historialService.remove(historial.historial_id).subscribe({
        next: () => {
          // Recargar la lista o actualizar localmente
          this.loadHistoriales();
        },
        error: (error) => {
          console.error('Error al eliminar historial:', error);
          this.error = 'Error al eliminar el registro de historial';
        }
      });
    }
  }
}
