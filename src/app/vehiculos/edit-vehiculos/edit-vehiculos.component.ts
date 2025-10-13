import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { VehiculosService } from '../services/vehiculos.service';

@Component({
  selector: 'app-edit-vehiculos',
  standalone: false,
  templateUrl: './edit-vehiculos.component.html',
  styleUrl: './edit-vehiculos.component.css'
})
export class EditVehiculosComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() vehiculo: Vehiculo | null = null;
  @Output() closeModal = new EventEmitter<void>();

  vehiculoForm!: FormGroup;
  mensajeError: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private vehiculosService: VehiculosService) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehiculo'] && this.vehiculo) {
      this.initForm();
      this.vehiculoForm.patchValue(this.vehiculo);
    }
  }

  tipoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === 'Seleccionar tipo' || value === '') {
      return { invalidTipo: true };
    }
    return null;
  }

  initForm() {
    this.vehiculoForm = this.fb.group({
      modelo: ['', Validators.required],
      matricula: [{ value: '', disabled: true }, Validators.required],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      tipo: ['Seleccionar tipo', [Validators.required, this.tipoValidator]],
      precio: ['', [Validators.required, Validators.min(0)]],
      capacidad: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onClose() {
    this.closeModal.emit();
    this.vehiculoForm.reset();
    this.mensajeError = '';
  }

  onSubmit() {
    if (this.vehiculoForm.valid && this.vehiculo?.vehiculo_id) {
      this.isLoading = true;
      this.mensajeError = '';

      const vehiculoEditado = this.vehiculoForm.value;

      // CORRECCIÓN: Pasar vehiculo_id como primer argumento
      this.vehiculosService.actualizarVehiculo(
        this.vehiculo.vehiculo_id,  // Primer argumento
        vehiculoEditado              // Segundo argumento
      ).subscribe({
        next: (response) => {
          console.log('Vehículo actualizado:', response);
          this.isLoading = false;
          this.onClose();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.isLoading = false;
          this.mensajeError = error.error?.message || 'Error al actualizar el vehículo';
        }
      });
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
