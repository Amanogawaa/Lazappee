import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductsService } from '../../../../service/products.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-placeorder',
  standalone: true,
  imports: [],
  templateUrl: './placeorder.component.html',
  styleUrl: './placeorder.component.css',
})
export class PlaceorderComponent implements OnInit {
  totalPrice = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: ProductsService,
    private dialog: MatDialog
  ) {
    console.log('Data received in dialog:', data);
  }

  ngOnInit(): void {
    this.totalItemPrice();
  }

  orderItem() {
    const data = {
      user_id: this.data.user_id,
      product_id: this.data.product_detail.product_id,
      quantity: this.data.quantity,
      cart_id: this.data.cart_id,
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
        this.service.orderItem(data).subscribe(
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
              `product-id-${this.data.user_id}-${this.data.product_id}`
            );
          },
          (error) => {
            console.error('Error during purchase', error);
          }
        );
      }
    });
  }

  totalItemPrice() {
    this.totalPrice = this.data.product_detail.price;
    this.totalPrice = Math.round(
      this.data.quantity * this.data.product_detail.price
    );
  }
}
