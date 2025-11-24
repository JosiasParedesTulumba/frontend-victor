import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class PermisosService {
    
    constructor(private authService: AuthService) { }

    // Permisos para la seccio de personas
    puedeEliminarPersona(): boolean {
        return this.esAdmin();
    }

    // Permisos para la seccion de historial
    puedeEliminarHistorial(): boolean {
        return this.esAdmin();
    }

    // Permisos para la seccion de pago
    puedeEliminarPago(): boolean {
        return this.esAdmin();
    }

    // Permisos para la seccion de reserva  
    puedeCrearReserva(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol !== 'SUPERVISOR';
    }

    puedeEditarReserva(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol !== 'SUPERVISOR';
    }

    puedeEliminarReserva(): boolean{
        return this.esAdmin();
    }

    // Permisos para la seccion de vehiculos
    puedeCrearVehiculo(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol !== 'SUPERVISOR';
    }

    puedeEditarVehiculo(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol !== 'SUPERVISOR';
    }

    puedeEliminarVehiculo(): boolean {
        return this.esAdmin();
    }

    puedeCambiarEstadoVehiculo(): boolean {
        return this.tieneRol(['ADMIN', 'EMPLEADO']);
    }

    // Métodos de verificación de roles
    esAdmin(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol === 'ADMIN';
    }

    esEmpleado(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol === 'EMPLEADO';
    }

    esSupervisor(): boolean {
        const user = this.authService.getCurrentUser();
        return user?.rol === 'SUPERVISOR';
    }

    // Método genérico para verificar roles
    tieneRol(roles: string | string[]): boolean {
        const user = this.authService.getCurrentUser();
        if (!user) return false;

        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return rolesArray.includes(user.rol);
    }
}