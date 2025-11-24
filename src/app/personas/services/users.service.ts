import { Injectable } from "@angular/core";
import { AuthService } from "../../auth/services/auth.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Usuario } from "../interfaces/user.interface";

@Injectable({
    providedIn: "root"
})
export class UsersService {
    private apiUrl = 'http://localhost:3000/api/usuarios'; // Ajusta según tu API

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders() {
        const token = this.authService.getToken();
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            })
        };
    }

    // Obtener todos los usuarios
    getUsuarios(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.apiUrl, this.getHeaders());
    }

    // Obtener un usuario por ID
    getUsuarioById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`, this.getHeaders());
    }

    // Crear un nuevo usuario
    createUsuario(usuario: Omit<Usuario, 'usuario_id'>): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, usuario, this.getHeaders());
    }

    // Actualizar un usuario existente
    updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, usuario, this.getHeaders());
    }

    // Eliminar un usuario
    deleteUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
    }

    // Obtener perfil del usuario actual
    getPerfil(): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/perfil`, this.getHeaders());
    }

    // Actualizar perfil del usuario actual
    updatePerfil(usuario: Partial<Usuario>): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.apiUrl}/perfil`, usuario, this.getHeaders());
    }
}