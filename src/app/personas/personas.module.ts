import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPeopleComponent } from './list-people/list-people.component';
import { NewPeopleComponent } from './new-people/new-people.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditPersonasComponent } from './edit-personas/edit-personas.component';

@NgModule({
  declarations: [
    ListPeopleComponent,
    NewPeopleComponent,
    EditPersonasComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
  ]
})
export class PersonasModule { }
