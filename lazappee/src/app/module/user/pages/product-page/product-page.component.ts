import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
})
export class ProductPageComponent implements OnInit {
  products: any[] = [];
  cartId: any;
  currId: any;

  item = 12;
  p = 1;

  constructor(private service: ProductsService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.cartId = this.service.getUserCart();
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

  addtoCart(product_id: number, quantity: number) {
    const data = {
      user_id: this.currId,
      cart_id: this.cartId,
      product_id: product_id,
      quantity: quantity,
    };
    this.service.addToCart(data).subscribe(
      (response) => {
     
        console.log('Product added to cart', response);
      },
      (error) => {
        console.error('Error adding product to cart', error);
      }
    );
  }
}
function a(a: any, b: any): number {
  throw new Error('Function not implemented.');
}
