import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../services/reservas.service';
import { Reserva } from '../interfaces/reserva.interface';
import { AuthService } from '../../auth/services/auth.service';
import { PermisosService } from '../../auth/services/permisos.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-list-reservas',
  templateUrl: './list-reservas.component.html',
  styleUrls: ['./list-reservas.component.css']
})
export class ListReservasComponent implements OnInit {
  isModalOpen = false;
  isEditModalOpen = false;
  reservaEditando: Reserva | null = null;

  filtroDniCliente: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';
  filtroMatricula: string = '';

  reservas: Reserva[] = [];

  constructor(
    private reservasService: ReservasService,
    public permisos: PermisosService
  ) { }

  ngOnInit() {
    this.cargarReservas();
  }

  get reservasFiltradas(): Reserva[] {
    return this.reservas.filter(reserva => {
      // Filtro por DNI del cliente
      if (this.filtroDniCliente && !reserva.persona.dni.toLowerCase().includes(this.filtroDniCliente.toLowerCase())) {
        return false;
      }

      // Filtro por estado
      if (this.filtroEstado) {
        const estadoTexto = this.getEstadoTexto(reserva.estado_reserva);
        if (estadoTexto !== this.filtroEstado) {
          return false;
        }
      }

      // Filtro por fecha (año)
      if (this.filtroFecha) {
        const anioReserva = new Date(reserva.fecha_reserva).getFullYear().toString();
        if (anioReserva !== this.filtroFecha) {
          return false;
        }
      }

      // Filtro por matrícula
      if (this.filtroMatricula && !reserva.vehiculo.matricula.toLowerCase().includes(this.filtroMatricula.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  cargarReservas() {
    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        Swal.fire('Error', 'No se pudieron cargar las reservas', 'error');
      }
    });
  }

  eliminarReserva(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.eliminarReserva(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La reserva ha sido eliminada.', 'success');
            this.cargarReservas();
          },
          error: (error) => {
            console.error('Error al eliminar reserva:', error);
            Swal.fire('Error', 'No se pudo eliminar la reserva', 'error');
          }
        });
      }
    });
  }

  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'Cancelada';
      case 1: return 'Pendiente';
      case 2: return 'Confirmada';
      case 3: return 'En Curso';
      case 4: return 'Completada';
      default: return 'Desconocido';
    }
  }

  getEstadoColor(estado: number): string {
    switch (estado) {
      case 0: return 'danger';    // Rojo
      case 1: return 'warning';   // Amarillo
      case 2: return 'success';   // Verde
      case 3: return 'primary';   // Azul
      case 4: return 'secondary'; // Gris
      default: return 'light';
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cargarReservas();
  }

  // eliminarReserva(index: number) {
  //   this.reservasService.eliminarReserva(index);
  //   this.cargarReservas();
  // }

  abrirModalEditar(reserva: Reserva) {
    this.reservaEditando = { ...reserva };
    this.isEditModalOpen = true;
  }

  cerrarModalEditar() {
    this.isEditModalOpen = false;
    this.reservaEditando = null;
    this.cargarReservas();
  }

  mostrarAcciones(): boolean {
    return !this.permisos.esSupervisor();
  }

  confirmarReserva(reserva: Reserva) {
    if (reserva.estado_reserva !== 1) {
      Swal.fire('Error', 'Solo se pueden confirmar reservas pendientes', 'error');
      return;
    }

    Swal.fire({
      title: '¿Confirmar reserva?',
      text: 'La reserva será marcada como confirmada y el vehículo quedará bloqueado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.confirmarReserva(reserva.reserva_id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Confirmada!',
              text: 'La reserva ha sido confirmada exitosamente',
              confirmButtonColor: '#28a745'
            });
            this.cargarReservas();
          },
          error: (error) => {
            console.error('Error al confirmar reserva:', error);
            Swal.fire('Error', 'No se pudo confirmar la reserva', 'error');
          }
        });
      }
    });
  }

  cancelarReserva(reserva: Reserva) {
    Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'La reserva pasará al estado Cancelada y el vehículo quedará disponible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.cancelarReserva(reserva.reserva_id).subscribe({
          next: () => {
            Swal.fire('¡Cancelada!', 'La reserva ha sido cancelada.', 'success');
            this.cargarReservas();
          },
          error: (error) => {
            console.error('Error al cancelar reserva:', error);
            Swal.fire('Error', 'No se pudo cancelar la reserva', 'error');
          }
        });
      }
    });
  }

  puedeConfirmar(reserva: Reserva): boolean {
    // Solo PENDIENTE y con al menos un pago
    return reserva.estado_reserva === 1 && !!(reserva.pago && reserva.pago.length > 0);
  }

  puedeCancelar(reserva: Reserva): boolean {
    return [1, 2, 3].includes(reserva.estado_reserva); // PENDIENTE, CONFIRMADA, EN_CURSO
  }

  puedeEditar(reserva: Reserva): boolean {
    return [1, 2].includes(reserva.estado_reserva); // PENDIENTE, CONFIRMADA
  }
}
