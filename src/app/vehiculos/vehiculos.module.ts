import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListVehiculosComponent } from './list-vehiculos/list-vehiculos.component';
import { NewVehiculoComponent } from './new-vehiculo/new-vehiculo.component';
import { EditVehiculosComponent } from './edit-vehiculos/edit-vehiculos.component';
import { PermisosService } from '../auth/services/permisos.service';

@NgModule({
  declarations: [
    ListVehiculosComponent,
    NewVehiculoComponent,
    EditVehiculosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    PermisosService
  ]
})
export class VehiculosModule { }
