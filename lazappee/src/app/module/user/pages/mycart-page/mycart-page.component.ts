import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { PlaceorderComponent } from '../../component/placeorder/placeorder.component';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-mycart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mycart-page.component.html',
  styleUrl: './mycart-page.component.css',
})
export class MycartPageComponent implements OnInit {
  items: any[] = [];
  cartId: any;
  currId: any;
  data: any;
  totalPrice = 0;
  product_image$: Observable<SafeResourceUrl | undefined> | undefined;
  selectedItems: any[] = [];

  constructor(
    private service: ProductsService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.cartId = this.service.getUserCart();
    this.loadItems(this.currId);
  }

  loadItems(id: any) {
    this.service.getUserItems(id).subscribe((res) => {
      console.log(res.payload);
      this.items = res.payload.items.map((item: any) => {
        const savedQuantity = localStorage.getItem(
          `product-id-${this.currId}-${item.product_id}`
        );
        if (savedQuantity) {
          item.quantity = parseInt(savedQuantity, 10);
        }

        item.product_image$ = this.service
          .getProductImage(item.product_id)
          .pipe(
            switchMap((imageResult) => {
              if (imageResult.size > 0) {
                const url = URL.createObjectURL(imageResult);
                return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
              } else {
                return of(undefined);
              }
            })
          );
        return item;
      });
    });
  }

  incrementQuantity(item: any) {
    if (item.quantity < item.product_stock) {
      item.quantity++;
      this.saveQuantity(item);
    }
  }

  decrementQuantity(item: any) {
    if (item.quantity > 0) {
      item.quantity--;
      this.saveQuantity(item);
    }
  }

  saveQuantity(item: any) {
    localStorage.setItem(
      `product-id-${this.currId}-${item.product_id}`,
      item.quantity.toString()
    );
  }

  removeToCart(product_id: any) {
    const data = {
      user_id: this.currId,
      product_id: product_id,
      cart_id: this.cartId,
    };
    Swal.fire({
      title: 'Are you sure you want to remove this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.removeToCart(data).subscribe((res) => {
          Swal.fire({
            title: 'Remove!',
            text: 'Item removed',
            icon: 'success',
          });
          this.loadItems(this.currId);
        });
      }
    });
  }

  toggleSelection(item: any, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedItems.push(item);
      console.log(this.selectedItems);
    } else {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem.product_id !== item.product_id
      );
    }
  }

  placeOrder() {
    if (this.selectedItems.length === 0) {
      Swal.fire({
        title: 'No items selected',
        icon: 'warning',
      });
      return;
    }

    const dialog = this.dialog.open(PlaceorderComponent, {
      data: {
        items: this.selectedItems,
        user_id: this.currId,
        cart_id: this.cartId,
      },
      maxWidth: '800px',
      width: '100%',
    });

    dialog.afterClosed().subscribe(() => {
      this.loadItems(this.currId);
      this.selectedItems = []; // Clear selection after placing order
    });
  }
}
