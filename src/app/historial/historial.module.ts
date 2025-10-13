import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListHistorialComponent } from './list-historial/list-historial.component';
import { NewHistorialComponent } from './new-historial/new-historial.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListHistorialComponent,
    NewHistorialComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class HistorialModule { }
