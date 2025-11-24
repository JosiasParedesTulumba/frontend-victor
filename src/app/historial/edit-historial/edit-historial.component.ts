import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { HVehiculo, UpdateHVehiculoDto } from '../interfaces/h-vehiculo.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistorialService } from '../services/historial.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-edit-historial',
  standalone: false,
  templateUrl: './edit-historial.component.html',
  styleUrls: ['./edit-historial.component.css']
})
export class EditHistorialComponent implements OnInit, OnChanges{
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
    this.loadVehiculos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['historialToEdit'] && this.historialToEdit) {
      this.loadHistorialData();
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
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.error = 'Error al cargar la lista de vehículos';
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
    this.historialForm.reset();
    this.error = '';
    this.closeModal.emit();
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

      this.historialService.update(this.historialToEdit.historial_id, formData).subscribe({
        next: (historialActualizado) => {
          this.loading = false;
          this.updateHistorial.emit(historialActualizado);
          this.historialForm.reset();
          this.onClose();
        },
        error: (error) => {
          console.error('Error al actualizar historial:', error);
          this.error = error.error?.message || 'Error al actualizar el historial. Verifique los datos.';
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
