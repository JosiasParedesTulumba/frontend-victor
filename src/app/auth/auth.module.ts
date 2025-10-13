import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [  
    LoginComponent
  ]
})
export class AuthModule { }
