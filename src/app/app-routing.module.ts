import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './layouts/layout.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ListReservasComponent } from './reservas/list-reservas/list-reservas.component';
import { ListPagosComponent } from './pagos/list-pagos/list-pagos.component';
import { ListVehiculosComponent } from './vehiculos/list-vehiculos/list-vehiculos.component';
import { ListHistorialComponent } from './historial/list-historial/list-historial.component';
import { ListPeopleComponent } from './personas/list-people/list-people.component';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // 👈 PROTEGER TODAS LAS RUTAS INTERNAS
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reservas', component: ListReservasComponent },
      { path: 'pagos', component: ListPagosComponent },
      { path: 'vehiculos', component: ListVehiculosComponent },
      { path: 'historial', component: ListHistorialComponent },
      { path: 'personas', component: ListPeopleComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
