import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PagosService } from '../services/pagos.service';
import { ReservasService } from '../../reservas/services/reservas.service';
import { AuthService } from '../../auth/services/auth.service';
import { Reserva } from '../../reservas/interfaces/reserva.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-pagos',
  standalone: false,
  templateUrl: './new-pagos.component.html',
  styleUrl: './new-pagos.component.css'
})
export class NewPagosComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  pagoForm!: FormGroup;
  mensajeError: string = '';
  reservas: Reserva[] = [];
  reservaSeleccionada: Reserva | null = null;

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private reservasService: ReservasService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
    this.cargarReservas();
    this.setupFormListeners();
  }

  initForm() {
    this.pagoForm = this.fb.group({
      reserva_id: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]], // CAMBIADO: Ya no está disabled
      metodo_pago: ['', Validators.required]
    });
  }

  setupFormListeners() {
    this.pagoForm.get('reserva_id')?.valueChanges.subscribe(reservaId => {
      this.calcularMontoPorReserva(reservaId);
    });
  }

  cargarReservas() {
    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        // Filtrar solo reservas activas
        this.reservas = reservas.filter(r => r.estado_reserva === 1);
        console.log('Reservas cargadas:', this.reservas); // Debug
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        Swal.fire('Error', 'No se pudieron cargar las reservas', 'error');
      }
    });
  }

  calcularMontoPorReserva(reservaId: number | string) {
    this.mensajeError = '';

    // Convertir a número si es string
    const id = Number(reservaId);

    if (!id || isNaN(id)) {
      this.pagoForm.get('monto')?.setValue('');
      this.reservaSeleccionada = null;
      return;
    }

    const reserva = this.reservas.find(r => r.reserva_id === id);

    console.log('Buscando reserva ID:', id); // Debug
    console.log('Reserva encontrada:', reserva); // Debug

    if (!reserva) {
      this.mensajeError = 'Reserva no encontrada.';
      this.pagoForm.get('monto')?.setValue('');
      this.reservaSeleccionada = null;
      return;
    }

    this.reservaSeleccionada = reserva;

    // Calcular días de reserva
    const fechaInicio = new Date(reserva.fecha_inicio);
    const fechaFin = new Date(reserva.fecha_fin);
    const dias = Math.max(1, Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)));

    // Calcular monto total
    const precioPorDia = Number(reserva.vehiculo.precio);
    const monto = dias * precioPorDia;

    console.log('Monto calculado:', monto); // Debug
    this.pagoForm.get('monto')?.setValue(monto.toFixed(2));
  }

  onClose() {
    this.closeModal.emit();
    this.pagoForm.reset();
    this.mensajeError = '';
    this.reservaSeleccionada = null;
  }

  onSubmit() {
    this.mensajeError = '';

    if (!this.pagoForm.valid) {
      this.mensajeError = 'Por favor, complete todos los campos requeridos';
      Object.keys(this.pagoForm.controls).forEach(key => {
        const control = this.pagoForm.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido: ${key}`, control.errors);
        }
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.mensajeError = 'No se pudo obtener la información del usuario';
      return;
    }

    // Obtener el valor del monto directamente del FormControl
    const montoValue = this.pagoForm.get('monto')?.value;

    console.log('Valor del formulario completo:', this.pagoForm.value); // Debug
    console.log('Monto a enviar:', montoValue); // Debug

    const pagoData = {
      reserva_id: Number(this.pagoForm.get('reserva_id')?.value),
      usuario_id: currentUser.usuario_id,
      fecha_pago: new Date().toISOString(),
      monto: String(montoValue), // Asegurar que sea string
      metodo_pago: Number(this.pagoForm.get('metodo_pago')?.value),
      estado_pago: 1, // Completado
      monto_ajuste: '0'
    };

    console.log('Datos a enviar:', pagoData); // Debug

    this.pagosService.addPago(pagoData).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Pago registrado correctamente', 'success');
        this.pagoForm.reset();
        this.onClose();
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        this.mensajeError = error.error?.message || 'Error al registrar el pago';
        Swal.fire('Error', this.mensajeError, 'error');
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getReservaDisplay(reserva: Reserva): string {
    return `#${reserva.reserva_id} - ${reserva.persona.nombre} ${reserva.persona.apellido}`;
  }
}
