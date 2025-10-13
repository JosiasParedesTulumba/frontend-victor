import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      nombre_usuario: this.username,
      contrasena: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:');
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else {
          this.errorMessage =
            'Error de conexión. Verifique que el servidor esté funcionando.';
        }
      },
    });
  };
}
