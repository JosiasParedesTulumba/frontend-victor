import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { VehiculosService } from '../services/vehiculos.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';

@Component({
  standalone: false,
  selector: 'app-new-vehiculo',
  templateUrl: './new-vehiculo.component.html',
  styleUrls: ['./new-vehiculo.component.css']
})
export class NewVehiculoComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  vehiculoForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private vehiculosService: VehiculosService
  ) { }

  ngOnInit() {
    this.initForm();
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
      matricula: ['', Validators.required],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      tipo: ['Seleccionar tipo', [Validators.required, this.tipoValidator]],
      precio: ['', [Validators.required, Validators.min(0)]],
      capacidad: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onClose() {
    this.vehiculoForm.reset({
      tipo: 'Seleccionar tipo'
    });
    this.errorMessage = '';
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.vehiculoForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const vehiculo = this.vehiculoForm.value;

      this.vehiculosService.addVehiculo(vehiculo).subscribe({
        next: (response) => {
          console.log('Vehículo creado:', response);
          this.isLoading = false;
          this.vehiculoForm.reset({
            tipo: 'Seleccionar tipo'
          });
          this.onClose();
        },
        error: (error) => {
          console.error('Error al crear vehículo:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al crear el vehículo';
        }
      });
    } else {
      console.log('Formulario inválido');
      Object.keys(this.vehiculoForm.controls).forEach(key => {
        this.vehiculoForm.get(key)?.markAsTouched();
      });
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}