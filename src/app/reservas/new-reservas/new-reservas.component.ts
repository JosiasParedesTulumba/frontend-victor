import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservasService } from '../services/reservas.service';
import { Reserva } from '../interfaces/reserva.interface';
import { PersonasService } from '../../personas/services/personas.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';

@Component({
  selector: 'app-new-reservas',
  standalone: false,
  templateUrl: './new-reservas.component.html',
  styleUrls: ['./new-reservas.component.css']
})
export class NewReservasComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  reservaForm!: FormGroup;
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private personasService: PersonasService,
    private vehiculosService: VehiculosService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reservaForm = this.fb.group({
      clienteDNI: ['', Validators.required],
      matricula: ['', Validators.required],
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


  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
