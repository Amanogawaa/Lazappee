import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product } from '../../product';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { switchMap, of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesComponent implements OnInit {
  products: Product[] = [];
  discountedProducts: Product[] = [];

  constructor(
    private service: ProductsService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(categoryId: number | null = null) {
    this.service.getAllProducts().subscribe({
      next: (result: any) => {
        if (result.payload && Array.isArray(result.payload)) {
          this.products = result.payload.map((item: any) => ({
            ...item,
            product_image$: this.service.getProductImage(item.id).pipe(
              switchMap((imageResult) => {
                if (imageResult.size > 0) {
                  const url = URL.createObjectURL(imageResult);
                  return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
                } else {
                  return of(undefined);
                }
              })
            ),
          }));

          this.discountedProducts = this.products.filter((product: any) => {
            return parseFloat(product.discount) > 0;
          });
        }
      },
    });
  }

  viewProduct(id: any) {
    this.router.navigate([`user/product-detail/${id}`]);
  }
}
