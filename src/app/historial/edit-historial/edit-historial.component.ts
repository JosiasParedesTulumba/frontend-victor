import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { HVehiculo, UpdateHVehiculoDto } from '../interfaces/h-vehiculo.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistorialService } from '../services/historial.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';
import { AuthService } from '../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-historial',
  standalone: false,
  templateUrl: './edit-historial.component.html',
  styleUrls: ['./edit-historial.component.css']
})
export class EditHistorialComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() historialToEdit: HVehiculo | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() updateHistorial = new EventEmitter<any>();

  historialForm!: FormGroup;
  loading = false;
  error = '';
  vehiculos: { vehiculo_id: number, matricula: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private historialService: HistorialService,
    private vehiculosService: VehiculosService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historialToEdit'] && this.historialToEdit) {
      this.loadHistorialData();
    }
    
    // Solo cargar vehículos cuando el modal se abre
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.loadVehiculos();
    }
  }

  initForm() {
    const currentUser = this.authService.getCurrentUser();

    this.historialForm = this.fb.group({
      vehiculo_id: ['', Validators.required],
      usuario_id: [currentUser?.usuario_id || '', Validators.required],
      tipo_evento: ['', Validators.required],
      fecha_evento: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadVehiculos() {
    this.vehiculosService.getMatriculas().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.error = '';
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.error = 'Error al cargar la lista de vehículos';
        // Solo mostrar SweetAlert si el modal está abierto
        if (this.isOpen) {
          Swal.fire('Error', 'No se pudieron cargar los vehículos', 'error');
        }
      }
    });
  }

  loadHistorialData() {
    if (this.historialToEdit) {
      const fechaEvento = new Date(this.historialToEdit.fecha_evento);
      const fechaFormateada = fechaEvento.toISOString().split('T')[0];

      this.historialForm.patchValue({
        vehiculo_id: this.historialToEdit.vehiculo_id,
        usuario_id: this.historialToEdit.usuario_id,
        tipo_evento: this.historialToEdit.tipo_evento,
        fecha_evento: fechaFormateada,
        descripcion: this.historialToEdit.descripcion
      });
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    // Verificar si el formulario tiene cambios sin guardar
    if (this.historialForm.dirty) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Tienes cambios sin guardar. ¿Deseas salir de todos modos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.historialForm.reset();
          this.error = '';
          this.closeModal.emit();
        }
      });
    } else {
      this.historialForm.reset();
      this.error = '';
      this.closeModal.emit();
    }
  }

  onSubmit(): void {
    if (this.historialForm.valid && this.historialToEdit) {
      this.loading = true;
      this.error = '';

      const formData: UpdateHVehiculoDto = {
        vehiculo_id: Number(this.historialForm.value.vehiculo_id),
        usuario_id: Number(this.historialForm.value.usuario_id),
        tipo_evento: this.historialForm.value.tipo_evento,
        descripcion: this.historialForm.value.descripcion,
        fecha_evento: new Date(this.historialForm.value.fecha_evento)
      };

      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Actualizando historial',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.historialService.update(this.historialToEdit.historial_id, formData).subscribe({
        next: (historialActualizado) => {
          this.loading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Emitir evento y cerrar modal
          this.updateHistorial.emit(historialActualizado);
          this.historialForm.reset();
          this.closeModal.emit();

          // Mostrar SweetAlert de éxito después de cerrar el modal
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'El historial ha sido actualizado correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            });
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar historial:', error);
          this.loading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Mostrar SweetAlert de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al actualizar el historial. Verifique los datos.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f44336'
          });
        }
      });
    } else {
      // Mostrar SweetAlert de validación
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FFA500'
      });
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.historialForm.controls).forEach(key => {
      const control = this.historialForm.get(key);
      control?.markAsTouched();
    });
  }
}
