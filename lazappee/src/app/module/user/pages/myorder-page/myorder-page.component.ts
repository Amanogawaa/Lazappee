import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SummaryComponent } from '../../component/summary/summary.component';

@Component({
  selector: 'app-myorder-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './myorder-page.component.html',
  styleUrl: './myorder-page.component.css',
})
export class MyorderPageComponent implements OnInit {
  currId: any;
  items: any;

  constructor(private service: ProductsService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadItems(this.currId);
  }

  loadItems(id: any) {
    this.service.getUserOrderItems(id).subscribe((res) => {
      this.items = res.payload;
      console.log(this.items);
    });
  }

  cancelOrder(product_id: any, order_id: any) {
    const data = {
      user_id: this.currId,
      order_id: order_id,
      product_id: product_id,
    };

    Swal.fire({
      title: 'Are you sure you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.cancelOrderItem(data).subscribe((res) => {
          Swal.fire({
            title: 'Cancelled!',
            text: 'Order cancelled',
            icon: 'success',
          });
          this.loadItems(this.currId);
        });
      }
    });
  }

  viewSummary(id: any) {
    const dialog = this.dialog.open(SummaryComponent, {
      data: {
        user_id: this.currId,
        order_id: id,
      },
      maxWidth: '800px',
      width: '100%',
    });
  }
}
