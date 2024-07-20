import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  cartId: any;
  currId: any;
  productId: any;
  quantity = 1;

  constructor(
    private service: ProductsService,
    private router: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.cartId = this.service.getUserCart();
    this.router.params.subscribe((param) => {
      this.productId = +param['id'];
      console.log(this.productId);
      console.log(this.currId);
      this.loadProduct(this.productId);
    });
  }

  loadProduct(id: any) {
    this.service.getAllProducts(id).subscribe((res) => {
      this.product = res[0];
      console.log(this.product);
    });
  }

  addtoCart(quantity: number) {
    const data = {
      user_id: this.currId,
      cart_id: this.cartId,
      product_id: this.productId,
      quantity: quantity,
    };
    this.service.addToCart(data).subscribe(
      (response) => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Product added to cart',
        });
        this.quantity++;
        console.log(this.quantity);
      },
      (error) => {
        console.error('Error adding product to cart', error);
      }
    );
  }

  buyNow(quantity: number) {
    const data = {
      user_id: this.currId,
      product_id: this.productId,
      quantity: quantity,
    };
    this.service.buyNow(data).subscribe(
      (response) => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Purchase successful',
        });
        console.log(response);
      },
      (error) => {
        console.error('Error during purchase', error);
      }
    );
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
