import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { VehiculosService } from '../services/vehiculos.service';
import Swal from 'sweetalert2';

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
      this.loadVehiculoData();
    }
  }

  tipoValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === 'Seleccionar tipo' || value === '') {
      return { invalidTipo: true };
    }
    return null;
  }

  matriculaValidator(control: AbstractControl): ValidationErrors | null {
    const part1 = control.get('matriculaPart1')?.value;
    const part2 = control.get('matriculaPart2')?.value;

    if (part1 && part2 && (part1.length !== 3 || part2.length !== 3)) {
      return { invalidMatriculaLength: true };
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

  loadVehiculoData() {
    if (this.vehiculo) {
      // Dividir la matrícula en dos partes
      const matriculaParts = this.vehiculo.matricula?.split('-') || ['', ''];

      this.vehiculoForm.patchValue({
        modelo: this.vehiculo.modelo,
        matriculaPart1: matriculaParts[0] || '',
        matriculaPart2: matriculaParts[1] || '',
        anio: this.vehiculo.anio,
        tipo: this.vehiculo.tipo,
        precio: this.vehiculo.precio,
        capacidad: this.vehiculo.capacidad
      });
    }
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

  private combineMatricula(): string {
    const part1 = this.vehiculoForm.get('matriculaPart1')?.value || '';
    const part2 = this.vehiculoForm.get('matriculaPart2')?.value || '';
    return `${part1}-${part2}`;
  }

  onClose() {
    // Verificar si el formulario tiene cambios sin guardar
    if (this.vehiculoForm.dirty && this.vehiculoForm.touched) {
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
          this.resetFormAndClose();
        }
      });
    } else {
      this.resetFormAndClose();
    }
  }

  private resetFormAndClose() {
    this.vehiculoForm.reset();
    this.mensajeError = '';
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.vehiculoForm.valid && this.vehiculo?.vehiculo_id) {
      this.isLoading = true;
      this.mensajeError = '';

      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Actualizando vehículo',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Combine the matricula parts before submitting
      const formValue = { ...this.vehiculoForm.value };
      formValue.matricula = this.combineMatricula();
      delete formValue.matriculaPart1;
      delete formValue.matriculaPart2;

      this.vehiculosService.actualizarVehiculo(
        this.vehiculo.vehiculo_id,
        formValue
      ).subscribe({
        next: (response) => {
          console.log('Vehículo actualizado:', response);
          this.isLoading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Cerrar el modal primero
          this.vehiculoForm.reset();
          this.closeModal.emit();

          // Mostrar SweetAlert de éxito después de cerrar el modal
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'El vehículo ha sido actualizado correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            });
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.isLoading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Mostrar SweetAlert de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al actualizar el vehículo',
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
