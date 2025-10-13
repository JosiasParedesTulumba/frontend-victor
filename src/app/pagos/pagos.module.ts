import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListPagosComponent } from './list-pagos/list-pagos.component';
import { NewPagosComponent } from './new-pagos/new-pagos.component';
import { EditPagosComponent } from './edit-pagos/edit-pagos.component';

@NgModule({
  declarations: [
    ListPagosComponent,
    NewPagosComponent,
    EditPagosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PagosModule { }
