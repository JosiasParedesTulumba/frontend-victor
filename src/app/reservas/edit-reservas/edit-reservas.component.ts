import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reserva } from '../interfaces/reserva.interface';
import { ReservasService } from '../services/reservas.service';

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

  constructor(private fb: FormBuilder, private reservasService: ReservasService) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reserva'] && this.reserva) {
      this.initForm();
      this.reservaForm.patchValue(this.reserva);
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
  }

  onSubmit() {
    this.mensajeError = '';
    if (this.reservaForm.valid && this.reserva) {
      const reservaEditada: Reserva = {
        ...this.reserva,
        ...this.reservaForm.getRawValue(),
        id: this.reserva.id,
        clienteDNI: this.reserva.clienteDNI,
        matricula: this.reserva.matricula
      };
      this.reservasService.actualizarReserva(reservaEditada);
      this.onClose();
    } else {
      this.mensajeError = 'Formulario inválido';
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
