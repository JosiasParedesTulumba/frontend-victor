import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(private router: Router, private authService: AuthService) { }

  username: string = '';
  password: string = '';
  hidePassword: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';

  togglePasswordVisibility = () => {
    this.hidePassword = !this.hidePassword;
  };

  onSubmit = () => {
    if (!this.username || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FFA500'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      nombre_usuario: this.username,
      contrasena: this.password,
    };

    // Mostrar SweetAlert de carga
    Swal.fire({
      title: 'Iniciando sesión',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Cerrar SweetAlert de carga
        Swal.close();

        // Navegar al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading = false;

        // Cerrar SweetAlert de carga
        Swal.close();

        // Mostrar SweetAlert de error
        let errorMessage = 'Error de conexión. Verifique que el servidor esté funcionando.';
        if (error.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: errorMessage,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f44336'
        });
      },
    });
  };
}
