import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pago } from '../interfaces/pago.interface';
import { PagosService } from '../services/pagos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-pagos',
  standalone: false,
  templateUrl: './edit-pagos.component.html',
  styleUrl: './edit-pagos.component.css'
})
export class EditPagosComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() pago: Pago | null = null;
  @Output() closeModal = new EventEmitter<void>();

  pagoForm!: FormGroup;
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pago'] && this.pago) {
      this.initForm();
      this.pagoForm.patchValue({
        metodo_pago: this.pago.metodo_pago,
        estado_pago: this.pago.estado_pago
      });
    }
  }

  initForm() {
    this.pagoForm = this.fb.group({
      metodo_pago: ['', Validators.required],
      estado_pago: ['', Validators.required]
    });
  }

  onClose() {
    this.closeModal.emit();
    this.pagoForm.reset();
    this.mensajeError = '';
  }

  onSubmit() {
    this.mensajeError = '';
    
    if (!this.pagoForm.valid || !this.pago?.pago_id) {
      this.mensajeError = 'Formulario inválido';
      return;
    }

    const pagoData = {
      metodo_pago: Number(this.pagoForm.get('metodo_pago')?.value),
      estado_pago: Number(this.pagoForm.get('estado_pago')?.value)
    };

    this.pagosService.actualizarPago(this.pago.pago_id, pagoData).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Pago actualizado correctamente', 'success');
        this.onClose();
      },
      error: (error) => {
        console.error('Error al actualizar pago:', error);
        this.mensajeError = error.error?.message || 'Error al actualizar el pago';
        Swal.fire('Error', this.mensajeError, 'error');
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getMetodoPagoText(metodo: number): string {
    const metodos: { [key: number]: string } = {
      1: 'Tarjeta',
      2: 'Efectivo',
      3: 'Transferencia',
      4: 'Depósito'
    };
    return metodos[metodo] || 'Desconocido';
  }
}
