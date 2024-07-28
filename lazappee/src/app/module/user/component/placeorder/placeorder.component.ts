import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductsService } from '../../../../service/products.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeorder',
  standalone: true,
  imports: [CommonModule],
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
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.totalPrice = this.data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
  }

  orderItems() {
    // Initialize an empty array to hold the items
    const itemsArray: { product_id: any; quantity: any; price: any }[] = [];

    // Iterate over the items to build the array
    this.data.items.forEach((item: any) => {
      itemsArray.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    });

    // Build the orderData object
    const orderData = {
      user_id: this.data.user_id,
      cart_id: this.data.cart_id,
      items: itemsArray,
    };

    console.log(orderData);

    Swal.fire({
      title: 'Are you sure you want to purchase these items?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, buy them!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.orderItem(orderData).subscribe(
          (response) => {
            Swal.fire({
              title: 'Order placed!',
              icon: 'success',
            });
            this.dialog.closeAll();
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
