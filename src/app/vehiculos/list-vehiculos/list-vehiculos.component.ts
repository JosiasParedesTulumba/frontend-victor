import { Component, OnInit } from '@angular/core';
import { VehiculosService } from '../services/vehiculos.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';

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

  constructor(private vehiculosService: VehiculosService) { }

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
    if (confirm(`¿Está seguro de eliminar el vehículo ${vehiculo.modelo}?`)) {
      if (vehiculo.vehiculo_id) {
        this.vehiculosService.eliminarVehiculo(vehiculo.vehiculo_id).subscribe({
          next: () => {
            this.cargarVehiculos();
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el vehículo');
          }
        });
      }
    }
  }

  alternarEstado(vehiculo: Vehiculo) {
    if (vehiculo.vehiculo_id) {
      // Cambiar entre activo (1) e inactivo (0)
      const nuevoEstado = vehiculo.estado_actual === 1 ? 0 : 1;

      this.vehiculosService.actualizarVehiculo(vehiculo.vehiculo_id, {
        estado_actual: nuevoEstado
      }).subscribe({
        next: () => {
          this.cargarVehiculos();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
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
        v.estado === this.filtroEstado;

      const cumpleFiltroAnio = !this.filtroAnio ||
        v.anio?.toString() === this.filtroAnio;

      const cumpleFiltroTipo = !this.filtroTipo ||
        v.tipo === this.filtroTipo;

      return cumpleFiltroMatricula && cumpleFiltroEstado && cumpleFiltroAnio && cumpleFiltroTipo;
    });
  }
}
