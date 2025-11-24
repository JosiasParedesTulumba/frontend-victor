import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistorialService } from '../services/historial.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';
import { AuthService } from '../../auth/services/auth.service';
import { CreateHVehiculoDto } from '../interfaces/h-vehiculo.interface';
import { Vehiculo } from '../../vehiculos/interfaces/vehiculo.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-historial',
  standalone: false,
  templateUrl: './new-historial.component.html',
  styleUrl: './new-historial.component.css'
})
export class NewHistorialComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveHistorial = new EventEmitter<any>();

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
    this.loadVehiculos();
  }

  initForm() {
    const currentUser = this.authService.getCurrentUser();

    this.historialForm = this.fb.group({
      vehiculo_id: ['', Validators.required],
      usuario_id: [currentUser?.usuario_id || '', Validators.required],
      tipo_evento: ['', Validators.required],
      fecha_evento: [new Date().toISOString().substring(0, 16), Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadVehiculos() {
    this.vehiculosService.getMatriculas().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.error = 'Error al cargar la lista de vehículos';
      }
    });
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
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
          this.resetForm();
          this.closeModal.emit();
        }
      });
    } else {
      this.resetForm();
      this.closeModal.emit();
    }
  }

  private resetForm() {
    this.historialForm.reset();
    this.error = '';
    const currentUser = this.authService.getCurrentUser();
    this.historialForm.patchValue({
      usuario_id: currentUser?.usuario_id || '',
      fecha_evento: new Date().toISOString().substring(0, 16)
    });
  }

  onSubmit(): void {
    if (this.historialForm.valid) {
      this.loading = true;
      this.error = '';

      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Creando historial',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const formData: CreateHVehiculoDto = {
        vehiculo_id: Number(this.historialForm.value.vehiculo_id),
        usuario_id: Number(this.historialForm.value.usuario_id),
        tipo_evento: this.historialForm.value.tipo_evento,
        descripcion: this.historialForm.value.descripcion,
        fecha_evento: new Date(this.historialForm.value.fecha_evento)
      };

      this.historialService.create(formData).subscribe({
        next: (nuevoHistorial) => {
          this.loading = false;
          
          // Cerrar SweetAlert de carga
          Swal.close();
          
          // Cerrar el modal
          this.resetForm();
          this.closeModal.emit();
          
          // Mostrar mensaje de éxito
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'El historial ha sido creado correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            });
          }, 100);
          
          this.saveHistorial.emit(nuevoHistorial);
        },
        error: (error) => {
          console.error('Error al crear historial:', error);
          this.loading = false;
          
          // Cerrar SweetAlert de carga
          Swal.close();
          
          // Mostrar mensaje de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al crear el historial. Verifique los datos.',
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
