import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { VehiculosService } from '../services/vehiculos.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import Swal from 'sweetalert2';

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
      matriculaPart1: ['', [Validators.required, Validators.pattern('^[A-Z0-9]{0,3}$')]],
      matriculaPart2: ['', [Validators.required, Validators.pattern('^[A-Z0-9]{0,3}$')]],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      tipo: ['Seleccionar tipo', [Validators.required, this.tipoValidator]],
      precio: ['', [Validators.required, Validators.min(0)]],
      capacidad: ['', [Validators.required, Validators.min(1)]]
    }, { validators: this.matriculaValidator });
  }

  matriculaValidator(control: AbstractControl): ValidationErrors | null {
    const part1 = control.get('matriculaPart1')?.value;
    const part2 = control.get('matriculaPart2')?.value;
    
    if (part1 && part2 && (part1.length !== 3 || part2.length !== 3)) {
      return { invalidMatriculaLength: true };
    }
    return null;
  }

  onMatriculaInput(part: 'matriculaPart1' | 'matriculaPart2') {
    const control = this.vehiculoForm.get(part);
    if (control) {
      let value = control.value.toUpperCase();
      // Remove any non-alphanumeric characters
      value = value.replace(/[^A-Z0-9]/g, '');
      // Limit to 3 characters
      value = value.substring(0, 3);
      control.setValue(value, { emitEvent: false });
      
      // Auto-focus to next input if current part is full
      if (value.length === 3) {
        const nextPart = part === 'matriculaPart1' ? 'matriculaPart2' : null;
        if (nextPart) {
          setTimeout(() => {
            const element = document.getElementById(nextPart);
            if (element) {
              element.focus();
            }
          });
        }
      }
    }
  }

  onClose() {
    // Verificar si el formulario tiene cambios sin guardar
    if (this.vehiculoForm.dirty) {
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
    this.vehiculoForm.reset({
      tipo: 'Seleccionar tipo'
    });
    this.errorMessage = '';
  }

  private combineMatricula(): string {
    const part1 = this.vehiculoForm.get('matriculaPart1')?.value || '';
    const part2 = this.vehiculoForm.get('matriculaPart2')?.value || '';
    return `${part1}-${part2}`;
  }

  onSubmit() {
    if (this.vehiculoForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Combine the matricula parts before submitting
      const formValue = { ...this.vehiculoForm.value };
      formValue.matricula = this.combineMatricula();
      delete formValue.matriculaPart1;
      delete formValue.matriculaPart2;

      const vehiculo = formValue;

      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Creando vehículo',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.vehiculosService.addVehiculo(vehiculo).subscribe({
        next: (response) => {
          console.log('Vehículo creado:', response);
          this.isLoading = false;
          
          // Cerrar SweetAlert de carga
          Swal.close();
          
          // Cerrar el modal primero
          this.resetForm();
          this.closeModal.emit();
          
          // Mostrar SweetAlert de éxito después de cerrar el modal
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'El vehículo ha sido creado correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            });
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear vehículo:', error);
          this.isLoading = false;
          
          // Cerrar SweetAlert de carga
          Swal.close();
          
          // Mostrar SweetAlert de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al crear el vehículo',
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
      
      // Marcar los campos como tocados para mostrar errores
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