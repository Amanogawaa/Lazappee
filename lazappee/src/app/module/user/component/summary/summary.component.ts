import { Component, Inject, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  order: any = {};
  productImages: { [key: number]: Observable<SafeResourceUrl | undefined> } =
    {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: ProductsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary() {
    this.service
      .userOrderItems(this.data.user_id, this.data.order_id)
      .subscribe((res) => {
        if (res && res.payload) {
          this.order = res.payload;
          if (this.order.items) {
            this.order.items.forEach((item: any) => {
              this.productImages[item.product_id] = this.getImage(
                item.product_id
              );
            });
          }
          console.log(this.order);
        }
      });
  }

  getImage(id: number): Observable<SafeResourceUrl | undefined> {
    return this.service.getProductImage(id).pipe(
      switchMap((imageResult) => {
        if (imageResult.size > 0) {
          const url = URL.createObjectURL(imageResult);
          return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        } else {
          return of(undefined);
        }
      })
    );
  }
}
