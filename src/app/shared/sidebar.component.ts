import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario
    this.authService.currentUser$.subscribe(user => {
      this.usuarioActual = user ? {
        nombreUsuario: user.nombre_usuario,
        rol: user.rol,
        nombre_completo: user.nombre_completo,
        email: user.email
      } : null;
    });
  }

  isCollapsed = false;
  activeItem = 'dashboard';

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bx bx-home', route: '/dashboard', badge: null },
    { id: 'reservas', label: 'Reservas', icon: 'bx bx-calendar-check', route: '/reservas', badge: null },
    { id: 'pagos', label: 'Pagos', icon: 'bx bx-credit-card', route: '/pagos', badge: null },
    { id: 'vehiculos', label: 'Vehículos', icon: 'bx bx-car', route: '/vehiculos', badge: null },
    { id: 'historial', label: 'Historial', icon: 'bx bx-history', route: '/historial', badge: null },
    { id: 'personas', label: 'Personas', icon: 'bx bx-user', route: '/personas', badge: null },
  ];

  usuarioActual: any = null;

  toggleSidebar = (): void => {
    this.isCollapsed = !this.isCollapsed;
  }

  clousesession = (): void => {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      this.authService.logout(); // 👈 USAR AuthService en lugar de localStorage
    }
  }
}
