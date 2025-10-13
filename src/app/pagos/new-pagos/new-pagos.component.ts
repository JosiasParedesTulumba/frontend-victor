import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PagosService } from '../services/pagos.service';
import { Pago } from '../interfaces/pago.interface';
import { ReservasService } from '../../reservas/services/reservas.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';

@Component({
  selector: 'app-new-pagos',
  standalone: false,
  templateUrl: './new-pagos.component.html',
  styleUrl: './new-pagos.component.css'
})
export class NewPagosComponent  { //implements OnInit
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  pagoForm!: FormGroup;
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private reservasService: ReservasService,
    private vehiculosService: VehiculosService
  ) {}

  // ngOnInit() {
  //   this.initForm();
  //   this.pagoForm.get('clienteDNI')?.valueChanges.subscribe(dni => {
  //     this.calcularMontoPorDNI(dni);
  //   });
  // }

  initForm() {
    this.pagoForm = this.fb.group({
      clienteDNI: ['', Validators.required],
      monto: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
      metodoPago: ['', Validators.required]
    });
  }

  // calcularMontoPorDNI(dni: string) {
  //   this.mensajeError = '';
  //   if (!dni) {
  //     this.pagoForm.get('monto')?.setValue('');
  //     return;
  //   }
  //   const reserva = this.reservasService.getReservas().find(r => r.clienteDNI === dni && r.estado === 'Activa');
  //   if (!reserva) {
  //     this.mensajeError = 'No hay una reserva activa para este cliente.';
  //     this.pagoForm.get('monto')?.setValue('');
  //     return;
  //   }
  //   const vehiculo = this.vehiculosService.getVehiculos().find(v => v.matricula === reserva.matricula);
  //   if (!vehiculo) {
  //     this.mensajeError = 'No se encontró el vehículo de la reserva.';
  //     this.pagoForm.get('monto')?.setValue('');
  //     return;
  //   }
  //   // Calcular días de reserva
  //   const fechaInicio = new Date(reserva.fechaInicio);
  //   const fechaFin = new Date(reserva.fechaFin);
  //   const dias = Math.max(1, Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)));
  //   const monto = dias * vehiculo.precio;
  //   this.pagoForm.get('monto')?.setValue(monto);
  // }

  onClose() {
    this.closeModal.emit();
    this.pagoForm.reset();
    this.mensajeError = '';
  }

  onSubmit() {
    this.mensajeError = '';
    if (this.pagoForm.valid) {
      const dni = this.pagoForm.get('clienteDNI')?.value;
      const reservaInfo = this.reservasService.getReservaActivaPorDNI(dni);
      if (!reservaInfo) {
        this.mensajeError = 'No hay una reserva activa para este cliente.';
        return;
      }
      const pago: Pago = {
        clienteDNI: dni,
        reservaId: reservaInfo.id,
        monto: this.pagoForm.get('monto')?.value,
        metodoPago: this.pagoForm.get('metodoPago')?.value
      };
      this.pagosService.addPago(pago);
      this.pagoForm.reset();
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
