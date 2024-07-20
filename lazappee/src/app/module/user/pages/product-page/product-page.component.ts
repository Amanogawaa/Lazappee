import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
})
export class ProductPageComponent implements OnInit {
  products: any[] = [];

  item = 12;
  p = 1;

  constructor(private service: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.service.getAllProducts().subscribe((res) => {
      this.products = res;
      this.sortStock();
    });
  }

  sortStock() {
    this.products.sort((a: any, b: any) => {
      return a.stock === 0 ? 1 : b.stock === 0 ? -1 : 0;
    });
  }

  viewProduct(id: any) {
    this.router.navigate([`user/product-detail/${id}`]);
  }
}
