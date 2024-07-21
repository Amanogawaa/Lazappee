import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mycart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mycart-page.component.html',
  styleUrl: './mycart-page.component.css',
})
export class MycartPageComponent implements OnInit {
  items: any[] = [];
  currId: any;
  quantity = 0;
  totalPrice = 0;

  constructor(private service: ProductsService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    console.log(this.currId);
    this.loadItems(this.currId);
  }

  loadItems(id: any) {
    this.service.getUserItems(id).subscribe((res) => {
      this.items = res.payload.items;
      console.log(res.payload.items);
    });
  }

  incrementQuantity() {
    // if (this.quantity <= this.items.stock)
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 0) {
      this.quantity--;
    }
  }

  // totalItemPrice() {
  //   this.totalPrice = this.items.price;
  //   this.totalPrice = Math.round(this.quantity * this.items.price);
  // }
}
