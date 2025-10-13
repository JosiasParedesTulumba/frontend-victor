import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistorialService } from '../services/historial.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';
import { AuthService } from '../../auth/services/auth.service';
import { CreateHVehiculoDto } from '../interfaces/h-vehiculo.interface';
import { Vehiculo } from '../../vehiculos/interfaces/vehiculo.interface';

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
  vehiculos: Vehiculo[] = [];

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
    this.vehiculosService.getVehiculos().subscribe({
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
    this.historialForm.reset();
    this.error = '';
    const currentUser = this.authService.getCurrentUser();
    this.historialForm.patchValue({
      usuario_id: currentUser?.usuario_id || '',
      fecha_evento: new Date().toISOString().substring(0, 16)
    });
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.historialForm.valid) {
      this.loading = true;
      this.error = '';

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
          this.saveHistorial.emit(nuevoHistorial);
          this.historialForm.reset();
          this.initForm(); // Reiniciar con valores por defecto
          this.onClose();
        },
        error: (error) => {
          console.error('Error al crear historial:', error);
          this.error = error.error?.message || 'Error al crear el historial. Verifique los datos.';
          this.loading = false;
        }
      });
    } else {
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
