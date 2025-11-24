import { Component, OnInit } from '@angular/core';
import { PagosService } from '../services/pagos.service';
import { Pago } from '../interfaces/pago.interface';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/services/auth.service';
import { PermisosService } from '../../auth/services/permisos.service';

@Component({
  selector: 'app-list-pagos',
  standalone: false,
  templateUrl: './list-pagos.component.html',
  styleUrl: './list-pagos.component.css'
})
export class ListPagosComponent implements OnInit {
  isModalOpen = false;
  isEditModalOpen = false;
  pagoEditando: Pago | null = null;

  filtroDniCliente: string = '';
  filtroFecha: string = '';
  filtroMetodo: string = '';

  pagos: Pago[] = [];

  constructor(
    private pagosService: PagosService,
    private authService: AuthService,
    public permisos: PermisosService
  ) {}

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.pagosService.getPagos().subscribe({
      next: (pagos) => {
        this.pagos = pagos;
      },
      error: (error) => {
        console.error('Error al cargar pagos:', error);
        Swal.fire('Error', 'No se pudieron cargar los pagos', 'error');
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cargarPagos();
  }

  eliminarPago(pago: Pago) {
    if (!pago.pago_id) return;
    
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
      if (result.isConfirmed && pago.pago_id) {
        this.pagosService.eliminarPago(pago.pago_id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El pago ha sido eliminado.', 'success');
            this.cargarPagos();
          },
          error: (error) => {
            console.error('Error al eliminar pago:', error);
            Swal.fire('Error', 'No se pudo eliminar el pago', 'error');
          }
        });
      }
    });
  }

  abrirModalEditar(pago: Pago) {
    this.pagoEditando = { ...pago };
    this.isEditModalOpen = true;
  }

  cerrarModalEditar() {
    this.isEditModalOpen = false;
    this.pagoEditando = null;
    this.cargarPagos();
  }

  getMetodoPagoText(metodo: number): string {
    const metodos: { [key: number]: string } = {
      1: 'Tarjeta',
      2: 'Efectivo',
      3: 'Transferencia',
      4: 'Depósito'
    };
    return metodos[metodo] || 'Desconocido';
  }

  getEstadoPagoText(estado: number): string {
    return estado === 1 ? 'Completado' : 'Pendiente';
  }
  
  puedesCrearPago(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol !== 'SUPERVISOR';
  }

  mostrarAcciones(): boolean {
    return !this.permisos.esSupervisor();
  }
}
