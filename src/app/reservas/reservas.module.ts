import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ListReservasComponent } from './list-reservas/list-reservas.component';
import { NewReservasComponent } from './new-reservas/new-reservas.component';
import { EditReservasComponent } from './edit-reservas/edit-reservas.component';
import { PermisosService } from '../auth/services/permisos.service';

@NgModule({
  declarations: [
    ListReservasComponent,
    NewReservasComponent,
    EditReservasComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    PermisosService
  ]
})
export class ReservasModule { }
