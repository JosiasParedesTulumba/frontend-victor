import { Component, OnInit } from '@angular/core';
import { PagosService } from '../services/pagos.service';
import { Pago } from '../interfaces/pago.interface';

@Component({
  selector: 'app-list-pagos',
  standalone: false,
  templateUrl: './list-pagos.component.html',
  styleUrl: './list-pagos.component.css'
})
export class ListPagosComponent implements OnInit {
  isModalOpen = false;
  isEditModalOpen = false;
  pagoEditando: Pago | null = null;

  filtroDniCliente: string = '';
  filtroFecha: string = '';
  filtroMetodo: string = '';

  pagos: Pago[] = [];

  constructor(private pagosService: PagosService) {}

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.pagos = this.pagosService.getPagos();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cargarPagos();
  }

  eliminarPago(index: number) {
    this.pagosService.eliminarPago(index);
    this.cargarPagos();
  }

  abrirModalEditar(pago: Pago) {
    this.pagoEditando = { ...pago };
    this.isEditModalOpen = true;
  }

  cerrarModalEditar() {
    this.isEditModalOpen = false;
    this.pagoEditando = null;
    this.cargarPagos();
  }
}
