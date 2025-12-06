import { Component, OnInit } from '@angular/core';
import { VehiculosService } from '../services/vehiculos.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { AuthService } from '../../auth/services/auth.service';
import { PermisosService } from '../../auth/services/permisos.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-list-vehiculos',
  templateUrl: './list-vehiculos.component.html',
  styleUrls: ['./list-vehiculos.component.css']
})
export class ListVehiculosComponent implements OnInit {

  isModalOpen = false;
  isEditModalOpen = false;
  vehiculoEditando: Vehiculo | null = null;

  filtroMatricula: string = '';
  filtroEstado: string = '';
  filtroAnio: string = '';
  filtroTipo: string = '';

  vehiculos: Vehiculo[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private vehiculosService: VehiculosService,
    public permisos: PermisosService
  ) { }

  ngOnInit() {
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.isLoading = true;
    this.errorMessage = '';

    this.vehiculosService.getVehiculos().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.errorMessage = 'Error al cargar los vehículos';
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los vehículos', 'error');
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cargarVehiculos();
  }

  eliminarVehiculo(vehiculo: Vehiculo) {
    if (!vehiculo.vehiculo_id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas marcar como inactivo el vehículo ${vehiculo.modelo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, marcar como inactivo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && vehiculo.vehiculo_id) {
        this.vehiculosService.eliminarVehiculo(vehiculo.vehiculo_id).subscribe({
          next: (response) => {
            Swal.fire(
              '¡Marcado como inactivo!',
              'El vehículo ha sido marcado como inactivo correctamente.',
              'success'
            );
            this.cargarVehiculos();
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            const mensajeError = error.error?.message ||
              'No se pudo marcar el vehículo como inactivo';
            Swal.fire('Error', mensajeError, 'error');
          }
        });
      }
    });
  }

  reactivarVehiculo(vehiculo: Vehiculo) {
    if (!vehiculo.vehiculo_id) return;

    Swal.fire({
      title: '¿Reactivar vehículo?',
      text: `¿Deseas reactivar el vehículo ${vehiculo.modelo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && vehiculo.vehiculo_id) {
        this.vehiculosService.actualizarVehiculo(vehiculo.vehiculo_id, {
          estado_actual: 1
        }).subscribe({
          next: () => {
            Swal.fire(
              '¡Reactivado!',
              'El vehículo ha sido reactivado correctamente.',
              'success'
            );
            this.cargarVehiculos();
          },
          error: (error) => {
            console.error('Error al reactivar:', error);
            Swal.fire('Error', 'No se pudo reactivar el vehículo', 'error');
          }
        });
      }
    });
  }

  alternarEstado(vehiculo: Vehiculo) {
    if (vehiculo.vehiculo_id) {
      // Cambiar entre activo (1) e inactivo (0)
      const nuevoEstado = vehiculo.estado_actual === 1 ? 0 : 1;
      const estadoTexto = nuevoEstado === 1 ? 'activar' : 'desactivar';

      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas ${estadoTexto} el vehículo ${vehiculo.modelo}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Sí, ${estadoTexto}`,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed && vehiculo.vehiculo_id) {
          this.vehiculosService.actualizarVehiculo(vehiculo.vehiculo_id, {
            estado_actual: nuevoEstado
          }).subscribe({
            next: () => {
              Swal.fire('¡Actualizado!', `El vehículo ha sido ${nuevoEstado === 1 ? 'activado' : 'desactivado'}.`, 'success');
              this.cargarVehiculos();
            },
            error: (error) => {
              console.error('Error al cambiar estado:', error);
              Swal.fire('Error', 'No se pudo cambiar el estado del vehículo', 'error');
            }
          });
        }
      });
    }
  }

  abrirModalEditar(vehiculo: Vehiculo) {
    this.vehiculoEditando = { ...vehiculo };
    this.isEditModalOpen = true;
  }

  cerrarModalEditar() {
    this.isEditModalOpen = false;
    this.vehiculoEditando = null;
    this.cargarVehiculos();
  }

  // Filtros
  get vehiculosFiltrados(): Vehiculo[] {
    return this.vehiculos.filter(v => {
      const cumpleFiltroMatricula = !this.filtroMatricula ||
        (v.matricula ?? '').toLowerCase().includes(this.filtroMatricula.toLowerCase());

      const cumpleFiltroEstado = !this.filtroEstado ||
        v.estadoActual === this.filtroEstado;

      const cumpleFiltroAnio = !this.filtroAnio ||
        v.anio?.toString() === this.filtroAnio;

      const cumpleFiltroTipo = !this.filtroTipo ||
        v.tipo === this.filtroTipo;

      return cumpleFiltroMatricula && cumpleFiltroEstado && cumpleFiltroAnio && cumpleFiltroTipo;
    });
  }

  // Agrega este método al componente
  mostrarAcciones(): boolean {
    return !this.permisos.esSupervisor();
  }
}
