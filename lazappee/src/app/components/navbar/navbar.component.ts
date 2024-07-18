import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ProductCardsComponent } from '../product-cards/product-cards.component';
import Swal from 'sweetalert2';
import { Router, RouterEvent } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ProductCardsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  constructor(private router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    initFlowbite();
  }

  loadProduct() {}

  logout(): void {
    Swal.fire({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Logout successfully',
        });
        sessionStorage.removeItem('token');
        this.router.navigate(['login']);
      }
    });
  }
}
