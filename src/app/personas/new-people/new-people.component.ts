import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonasService } from '../services/personas.service';
import { Rol, RolesService } from '../services/roles.service';
import { PermisosService } from '../../auth/services/permisos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-people',
  standalone: false,
  templateUrl: './new-people.component.html',
  styleUrls: ['./new-people.component.css']
})
export class NewPeopleComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  personaForm!: FormGroup;
  roles: Rol[] = []; // Cargar desde API
  selectedRol: Rol | null = null;
  mostrarContrasena: boolean = false;
  isLoading = false;
  errorMessage = '';

  get esEmpleado(): boolean {
    return this.personaForm?.get('tipoPersona')?.value === 'Empleado';
  }

  constructor(
    private fb: FormBuilder,
    private personasService: PersonasService,
    private rolService: RolesService,
    public permisos: PermisosService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarRoles();

    if (this.permisos.esAdmin()) {
      this.tiposPersonaDisponibles = ['Cliente', 'Empleado'];
    } else {
      this.tiposPersonaDisponibles = ['Cliente'];
    }
  }

  initForm(): void {
    this.personaForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      correo: ['', [Validators.required, Validators.email]],
      tipoPersona: ['Cliente', Validators.required],
      // Campos de empleado, inicialmente deshabilitados
      nombreUsuario: [{ value: '', disabled: true }, Validators.required],
      contrasena: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      puesto: [{ value: '', disabled: true }, Validators.required],
      rol: [{ value: '', disabled: true }, Validators.required]
    });

    // Suscribirse a cambios en tipoPersona
    this.personaForm.get('tipoPersona')?.valueChanges.subscribe(valor => {
      if (valor === 'Empleado') {
        this.personaForm.get('nombreUsuario')?.enable();
        this.personaForm.get('contrasena')?.enable();
        this.personaForm.get('puesto')?.enable();
        this.personaForm.get('rol')?.enable();
      } else {
        this.personaForm.get('nombreUsuario')?.disable();
        this.personaForm.get('contrasena')?.disable();
        this.personaForm.get('puesto')?.disable();
        this.personaForm.get('rol')?.disable();
      }
    });
  }

  // Cargar roles desde la API
  cargarRoles(): void {
    this.rolService.findAll().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
        // Roles de respaldo si falla la API
        this.roles = [
          { rol_id: 1, nombre_rol: 'ADMIN', estado_rol: 1 },
          { rol_id: 2, nombre_rol: 'EMPLEADO', estado_rol: 1 },
          { rol_id: 3, nombre_rol: 'SUPERVISOR', estado_rol: 1 }
        ];
      }
    });
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    // Verificar si el formulario tiene cambios sin guardar
    if (this.personaForm.dirty) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Tienes cambios sin guardar. ¿Deseas salir de todos modos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetForm();
          this.closeModal.emit();
        }
      });
    } else {
      this.resetForm();
      this.closeModal.emit();
    }
  }

  private resetForm(): void {
    this.personaForm.reset({
      tipoPersona: 'Cliente', // Valor por defecto
      rol: ''
    });
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.personaForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.personaForm.value;

      if (!this.permisos.esAdmin()) {
        formData.tipoPersona = 'Cliente';
      }
      // Preparar datos para la API
      const personaData = {
        dni: formData.dni,
        nombre: formData.nombres,
        apellido: formData.apellidos,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        tipo_persona: formData.tipoPersona === 'Cliente' ? 1 : 2,
        puesto: formData.puesto || 'Cliente',
      };

      // Si es empleado, agregar datos de usuario
      if (formData.tipoPersona === 'Empleado') {
        Object.assign(personaData, {
          nombre_usuario: formData.nombreUsuario,
          contrasena: formData.contrasena,
          rol_id: parseInt(formData.rol)
        });
      }

      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Creando persona',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Enviar a la API
      this.personasService.addPersona(personaData).subscribe({
        next: (response) => {
          console.log('Persona creada:');
          this.isLoading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Cerrar el modal primero
          this.resetForm();
          this.closeModal.emit();

          // Mostrar SweetAlert de éxito después de cerrar el modal
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'La persona ha sido creada correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            });
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear persona:', error);
          this.isLoading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Mostrar SweetAlert de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al crear la persona',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f44336'
          });
        }
      });
    } else {
      // Mostrar SweetAlert de validación
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FFA500'
      });

      // Marcar campos como touched para mostrar errores
      Object.keys(this.personaForm.controls).forEach(key => {
        this.personaForm.get(key)?.markAsTouched();
      });
    }
  }

  // Método para validar campos
  isFieldInvalid(fieldName: string): boolean {
    const field = this.personaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Obtener mensaje de error para un campo
  getFieldError(fieldName: string): string {
    const field = this.personaForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['pattern']) {
        if (fieldName === 'dni') return 'DNI debe tener 8 dígitos';
        if (fieldName === 'telefono') return 'Teléfono debe tener 9 dígitos';
      }
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  tiposPersonaDisponibles: string[] = [];
}
