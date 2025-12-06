import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  mensaje: string = '';
  reservasActivas: string = '';

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.dashboardService.getVehiculosDisponibles().subscribe(
      (data) => {
        this.mensaje = data.cantidad;
      },
      (error) => {
        console.error('Error al cargar vehículos disponibles', error);
      }
    );

    this.dashboardService.getReservasActivas().subscribe(
      (data) => {
        this.reservasActivas = data.cantidad;
      },
      (error) => {
        console.error('Error al cargar reservas activas', error);
      }
    );
  }
}
