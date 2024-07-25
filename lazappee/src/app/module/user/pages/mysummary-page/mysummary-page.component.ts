import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-mysummary-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mysummary-page.component.html',
  styleUrl: './mysummary-page.component.css',
})
export class MysummaryPageComponent implements OnInit {
  currId: any;
  items: any;
  product_image$: Observable<SafeResourceUrl | undefined> | undefined;

  constructor(
    private service: ProductsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadItem(this.currId);
  }

  loadItem(id: any) {
    this.service.getUserOrderItems(id).subscribe((res) => {
      if (res && res.payload) {
        this.items = res.payload.map((item: any) => {
          if (item.items) {
            item.items = item.items.map((product: any) => {
              product.image$ = this.getImage(product.product_id);
              return product;
            });
          }
          return item;
        });
      } else {
        this.items = [];
      }
    });
  }

  getImage(id: any): Observable<SafeResourceUrl | undefined> {
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
