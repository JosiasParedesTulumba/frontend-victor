import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../services/reservas.service';
import { Reserva } from '../interfaces/reserva.interface';
import { AuthService } from '../../auth/services/auth.service';
import { PermisosService } from '../../auth/services/permisos.service';

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
  ) {}  

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
      }
    });
  }

  eliminarReserva(id: number) {
    if (confirm('¿Está seguro de eliminar esta reserva?')) {
      this.reservasService.eliminarReserva(id).subscribe({
        next: () => {
          this.cargarReservas();
        },
        error: (error) => {
          console.error('Error al eliminar reserva:', error);
        }
      });
    }
  }

  getEstadoTexto(estado: number): string {
    return estado === 1 ? 'Activa' : 'Cancelada';
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
}
