import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Persona } from '../interfaces/persona.interface';
import { PersonasService } from '../services/personas.service';
import { RolesService } from '../services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-personas',
  standalone: false,
  templateUrl: './edit-personas.component.html',
  styleUrl: './edit-personas.component.css'
})
export class EditPersonasComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() persona: Persona | null = null;
  @Output() closeModal = new EventEmitter<void>();

  personaForm!: FormGroup;
  roles: any[] = [];
  mostrarContrasena: boolean = false;
  isLoading = false;
  errorMessage = '';

  get esEmpleado(): boolean {
    return this.personaForm?.get('tipoPersona')?.value === 'Empleado';
  }

  constructor(
    private fb: FormBuilder,
    private personasService: PersonasService,
    private rolesService: RolesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarRoles()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['persona'] && this.persona && this.personaForm) {
      this.llenarFormulario();
    }
  }

  initForm(): void {
    this.personaForm = this.fb.group({
      dni: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      correo: ['', [Validators.required, Validators.email]],
      // tipoPersona deshabilitado desde la creación
      tipoPersona: [{ value: 'Cliente', disabled: true }, Validators.required],
      nombreUsuario: [{ value: '', disabled: true }],
      contrasena: [{ value: '', disabled: true }],
      puesto: [{ value: '', disabled: true }, Validators.required],
      rol: [{ value: '', disabled: true }, Validators.required]
    });

    // Manejar cambios en tipoPersona
    this.personaForm.get('tipoPersona')?.valueChanges.subscribe(valor => {
      if (valor === 'Empleado') {
        this.personaForm.get('nombreUsuario')?.enable();
        this.personaForm.get('puesto')?.enable();
        this.personaForm.get('rol')?.enable();
        // Contraseña opcional en edición
        this.personaForm.get('contrasena')?.enable();
      } else {
        this.personaForm.get('nombreUsuario')?.disable();
        this.personaForm.get('contrasena')?.disable();
        this.personaForm.get('puesto')?.disable();
        this.personaForm.get('rol')?.disable();
      }
    });
  }

  llenarFormulario(): void {
    if (this.persona) {
      this.personaForm.patchValue({
        dni: this.persona.dni,
        nombres: this.persona.nombres,
        apellidos: this.persona.apellidos,
        direccion: this.persona.direccion,
        telefono: this.persona.telefono,
        correo: this.persona.correo,
        tipoPersona: this.persona.tipoPersona,
        nombreUsuario: this.persona.nombreUsuario,
        puesto: this.persona.puesto,
        rol: this.persona.usuario?.rol?.rol_id || ''
      });
    }
  }

  cargarRoles(): void {
    this.rolesService.findAll().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
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
          this.personaForm.reset();
          this.errorMessage = '';
          this.closeModal.emit();
        }
      });
    } else {
      this.personaForm.reset();
      this.errorMessage = '';
      this.closeModal.emit();
    }
  }

  onSubmit(): void {
    if (this.personaForm.valid && this.persona?.persona_id) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.personaForm.value;

      const updateData = {
        dni: formData.dni,
        nombre: formData.nombres,
        apellido: formData.apellidos,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        puesto: formData.puesto || 'Cliente'
      };

      // Si es empleado y tiene campos de usuario
      if (formData.tipoPersona === 'Empleado') {
        Object.assign(updateData, {
          nombre_usuario: formData.nombreUsuario,
          rol_id: parseInt(formData.rol)
        });

        // Solo enviar contraseña si se cambió
        if (formData.contrasena && formData.contrasena.trim() !== '') {
          Object.assign(updateData, {
            contrasena: formData.contrasena
          });
        }
      }

      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Actualizando persona',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.personasService.actualizarPersona(this.persona.persona_id, updateData).subscribe({
        next: () => {
          this.isLoading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Cerrar el modal primero
          this.personaForm.reset();
          this.errorMessage = '';
          this.closeModal.emit();

          // Mostrar SweetAlert de éxito después de cerrar el modal
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'La persona ha sido actualizada correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            });
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar persona:', error);
          this.isLoading = false;

          // Cerrar SweetAlert de carga
          Swal.close();

          // Mostrar SweetAlert de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al actualizar la persona',
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
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.personaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.personaForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['pattern']) {
        if (fieldName === 'dni') return 'DNI debe tener 8 dígitos';
        if (fieldName === 'telefono') return 'Teléfono debe tener 9 dígitos';
      }
    }
    return '';
  }

}
