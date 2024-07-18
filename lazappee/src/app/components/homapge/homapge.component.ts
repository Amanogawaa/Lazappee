import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-homapge',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './homapge.component.html',
  styleUrl: './homapge.component.css',
})
export class HomapgeComponent {}
