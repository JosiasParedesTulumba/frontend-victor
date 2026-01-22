import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reserva } from '../interfaces/reserva.interface';
import { ReservasService } from '../services/reservas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-reservas',
  standalone: false,
  templateUrl: './edit-reservas.component.html',
  styleUrl: './edit-reservas.component.css'
})
export class EditReservasComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() reserva: Reserva | null = null;
  @Output() closeModal = new EventEmitter<void>();

  reservaForm!: FormGroup;
  mensajeError: string = '';
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private reservasService: ReservasService) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reserva'] && this.reserva) {
      this.initForm();
      // Mapear los datos de la reserva al formulario
      this.reservaForm.patchValue({
        clienteDNI: this.reserva.persona.dni,
        matricula: this.reserva.vehiculo.matricula,
        fechaInicio: this.formatearFechaParaInput(this.reserva.fecha_inicio),
        fechaFin: this.formatearFechaParaInput(this.reserva.fecha_fin),
        descripcion: this.reserva.descripcion
      });
    }
  }

  initForm() {
    this.reservaForm = this.fb.group({
      clienteDNI: [{ value: '', disabled: true }, Validators.required],
      matricula: [{ value: '', disabled: true }, Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  onClose() {
    this.closeModal.emit();
    this.reservaForm.reset();
    this.mensajeError = '';
    this.isSubmitting = false;
  }

  onSubmit() {
    this.mensajeError = '';

    if (this.reservaForm.invalid) {
      this.mensajeError = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (!this.reserva) {
      this.mensajeError = 'No hay reserva seleccionada';
      return;
    }

    const formValue = this.reservaForm.getRawValue();

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(formValue.fechaFin) <= new Date(formValue.fechaInicio)) {
      this.mensajeError = 'La fecha de fin debe ser posterior a la fecha de inicio';
      return;
    }

    this.isSubmitting = true;

    const reservaData = {
      fecha_inicio: formValue.fechaInicio,
      fecha_fin: formValue.fechaFin,
      descripcion: formValue.descripcion
    };

    this.reservasService.actualizarReserva(this.reserva.reserva_id, reservaData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Reserva actualizada!',
          text: 'Los cambios se han guardado exitosamente',
          confirmButtonColor: '#28a745'
        });
        this.onClose();
      },
      error: (error) => {
        console.error('Error al actualizar reserva:', error);
        this.isSubmitting = false;

        let errorMessage = 'Error al actualizar la reserva';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  formatearFechaParaInput(fecha: Date): string {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
