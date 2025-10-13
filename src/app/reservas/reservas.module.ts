import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListReservasComponent } from './list-reservas/list-reservas.component';
import { NewReservasComponent } from './new-reservas/new-reservas.component';
import { EditReservasComponent } from './edit-reservas/edit-reservas.component';

@NgModule({
  declarations: [
    ListReservasComponent,
    NewReservasComponent,
    EditReservasComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ReservasModule { }
