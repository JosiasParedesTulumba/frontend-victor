import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { LayoutComponent } from './layouts/layout.component';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ReservasModule } from './reservas/reservas.module';
import { PagosModule } from './pagos/pagos.module';
import { HistorialModule } from './historial/historial.module';
import { PersonasModule } from './personas/personas.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AuthModule,
    LayoutComponent,
    VehiculosModule,
    ReservasModule,
    PagosModule,
    HistorialModule,
    PersonasModule,
    DashboardModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
