import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../services/reservas.service';
import { Reserva } from '../interfaces/reserva.interface';

@Component({
  standalone: false,
  selector: 'app-list-reservas',
  templateUrl: './list-reservas.component.html',
  styleUrls: ['./list-reservas.component.css']
})
export class ListReservasComponent implements OnInit {
  isModalOpen = false;
  isEditModalOpen = false;
  reservaEditando: Reserva | null = null;

  filtroDniCliente: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';
  filtroMatricula: string = '';

  reservas: Reserva[] = [];

  constructor(private reservasService: ReservasService) {}

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.reservas = this.reservasService.getReservas();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cargarReservas();
  }

  // eliminarReserva(index: number) {
  //   this.reservasService.eliminarReserva(index);
  //   this.cargarReservas();
  // }

  abrirModalEditar(reserva: Reserva) {
    this.reservaEditando = { ...reserva };
    this.isEditModalOpen = true;
  }

  cerrarModalEditar() {
    this.isEditModalOpen = false;
    this.reservaEditando = null;
    this.cargarReservas();
  }
}
