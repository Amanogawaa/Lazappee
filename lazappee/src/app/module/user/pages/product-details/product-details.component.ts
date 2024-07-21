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
  quantity = 0;
  totalPrice = 0;

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

    const savedQuantity = localStorage.getItem(
      `product-id-${this.currId}-${this.productId}`
    );
    if (savedQuantity) {
      this.quantity = parseInt(savedQuantity, 10);
    }
  }

  loadProduct(id: any) {
    this.service.getAllProducts(id).subscribe((res) => {
      this.product = res[0];
      this.totalItemPrice();
    });
  }

  addtoCart(quantity: number) {
    const data = {
      user_id: this.currId,
      cart_id: this.cartId,
      product_id: this.productId,
      quantity: quantity,
    };
    Swal.fire({
      title: 'Add this to cart?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
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
              title: 'Item added to cart',
            });
            this.quantity++;
            console.log(this.quantity);
          },
          (error) => {
            console.error('Error adding product to cart', error);
          }
        );
      }
    });
  }

  buyNow(quantity: number) {
    const data = {
      user_id: this.currId,
      product_id: this.productId,
      quantity: quantity,
    };
    Swal.fire({
      title: 'Are you sure you want to purchase this item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, buy it!',
    }).then((result) => {
      if (result.isConfirmed) {
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
              title: 'Order placed!',
              icon: 'success',
            });
            localStorage.removeItem(
              `product-id-${this.currId}-${this.productId}`
            );
            this.quantity = 1;
          },
          (error) => {
            console.error('Error during purchase', error);
          }
        );
      }
    });
  }

  incrementQuantity() {
    if (this.quantity <= this.product.stock) this.quantity++;
    this.totalItemPrice();
    this.saveQuantity();
  }

  decrementQuantity() {
    if (this.quantity > 0) {
      this.quantity--;
    }
    this.totalItemPrice();
    this.saveQuantity();
  }

  saveQuantity() {
    localStorage.setItem(
      `product-id-${this.currId}-${this.productId}`,
      this.quantity.toString()
    );
  }

  totalItemPrice() {
    this.totalPrice = this.product.price;
    this.totalPrice = Math.round(this.quantity * this.product.price);
  }
}
