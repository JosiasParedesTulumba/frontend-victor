import { Component } from '@angular/core';
import { SidebarComponent } from '../shared/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {} 