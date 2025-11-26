import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class DashboardService {

    constructor(
        private http: HttpClient
    ) { }

    private apiUrl = 'http://localhost:3000/api/dashboard';

    getVehiculosDisponibles(): Observable<any> {
        return this.http.get(`${this.apiUrl}/cantidad/disponibles`);
    }

}