import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pago } from '../interfaces/pago.interface';
import { PagosService } from '../services/pagos.service';
import { ReservasService } from '../../reservas/services/reservas.service';
import { VehiculosService } from '../../vehiculos/services/vehiculos.service';

@Component({
  selector: 'app-edit-pagos',
  standalone: false,
  templateUrl: './edit-pagos.component.html',
  styleUrl: './edit-pagos.component.css'
})
export class EditPagosComponent  { //implements OnInit, OnChanges
  // @Input() isOpen: boolean = false;
  // @Input() pago: Pago | null = null;
  // @Output() closeModal = new EventEmitter<void>();

  // pagoForm!: FormGroup;
  // mensajeError: string = '';

  // constructor(
  //   private fb: FormBuilder,
  //   private pagosService: PagosService,
  //   private reservasService: ReservasService,
  //   private vehiculosService: VehiculosService
  // ) {}

  // ngOnInit() {
  //   this.initForm();
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['pago'] && this.pago) {
  //     this.initForm();
  //     this.pagoForm.patchValue(this.pago);
  //     this.calcularMonto();
  //   }
  // }

  // initForm() {
  //   this.pagoForm = this.fb.group({
  //     clienteDNI: [{ value: '', disabled: true }, Validators.required],
  //     reservaId: [{ value: '', disabled: true }, Validators.required],
  //     monto: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
  //     metodoPago: ['', Validators.required]
  //   });
  // }

  // calcularMonto() {
  //   if (!this.pago || !this.pago.reservaId) return;
  //   const reserva = this.reservasService.getReservas().find(r => r.id === this.pago!.reservaId);
  //   if (!reserva) return;
  //   const vehiculo = this.vehiculosService.getVehiculos().find(v => v.matricula === reserva.matricula);
  //   if (!vehiculo) return;
  //   const fechaInicio = new Date(reserva.fechaInicio);
  //   const fechaFin = new Date(reserva.fechaFin);
  //   const dias = Math.max(1, Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)));
  //   const monto = dias * vehiculo.precio;
  //   this.pagoForm.get('monto')?.setValue(monto);
  // }

  // onClose() {
  //   this.closeModal.emit();
  //   this.pagoForm.reset();
  //   this.mensajeError = '';
  // }

  // onSubmit() {
  //   this.mensajeError = '';
  //   if (this.pagoForm.valid && this.pago) {
  //     const pagoEditado: Pago = {
  //       ...this.pago,
  //       ...this.pagoForm.getRawValue(),
  //       id: this.pago.id,
  //       clienteDNI: this.pago.clienteDNI,
  //       reservaId: this.pago.reservaId
  //     };
  //     this.pagosService.actualizarPago(pagoEditado);
  //     this.onClose();
  //   } else {
  //     this.mensajeError = 'Formulario inválido';
  //   }
  // }

  // onBackdropClick(event: Event) {
  //   if (event.target === event.currentTarget) {
  //     this.onClose();
  //   }
  // }
}
