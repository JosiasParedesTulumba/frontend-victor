import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListVehiculosComponent } from './list-vehiculos/list-vehiculos.component';
import { NewVehiculoComponent } from './new-vehiculo/new-vehiculo.component';
import { EditVehiculosComponent } from './edit-vehiculos/edit-vehiculos.component';

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
  ]
})
export class VehiculosModule { }
