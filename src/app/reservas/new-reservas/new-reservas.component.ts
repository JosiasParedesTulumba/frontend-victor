import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservasService } from '../services/reservas.service';
import { Reserva } from '../interfaces/reserva.interface';
import { PersonasService } from '../../personas/services/personas.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';
import Swal from 'sweetalert2';

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
  clientes: any[] = [];
  vehiculos: any[] = [];
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private personasService: PersonasService,
    private vehiculosService: VehiculosService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarClientes();
    this.cargarVehiculos();
  }

  initForm() {
    this.reservaForm = this.fb.group({
      persona_id: ['', Validators.required],
      vehiculo_id: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  cargarClientes() {
    this.personasService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  cargarVehiculos() {
    this.vehiculosService.getVehiculosDisponibles().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
      }
    });
  }

  onClose() {
    this.closeModal.emit();
    this.reservaForm.reset({
      persona_id: '',
      vehiculo_id: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: ''
    });
    this.mensajeError = '';
    this.isSubmitting = false;
  }

  onSubmit() {
    this.mensajeError = '';
    
    if (this.reservaForm.invalid) {
      this.mensajeError = 'Por favor complete todos los campos requeridos';
      return;
    }

    const formValue = this.reservaForm.value;
    
    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(formValue.fechaFin) <= new Date(formValue.fechaInicio)) {
      this.mensajeError = 'La fecha de fin debe ser posterior a la fecha de inicio';
      return;
    }

    this.isSubmitting = true;

    const reservaData = {
      persona_id: parseInt(formValue.persona_id),
      vehiculo_id: parseInt(formValue.vehiculo_id),
      fecha_inicio: formValue.fechaInicio,
      fecha_fin: formValue.fechaFin,
      descripcion: formValue.descripcion
    };

    this.reservasService.createReserva(reservaData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: '¡Reserva creada!',
          text: 'La reserva se ha registrado exitosamente',
          confirmButtonColor: '#28a745'
        });
        this.onClose();
        // Recargar la lista de vehículos disponibles
        this.cargarVehiculos();
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        this.isSubmitting = false;
        
        let errorMessage = 'Error al crear la reserva';
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
}
