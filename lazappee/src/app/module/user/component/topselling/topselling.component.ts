import { Component, OnInit } from '@angular/core';
import { Product } from '../../product';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ProductsService } from '../../../../service/products.service';
import { switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topselling',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topselling.component.html',
  styleUrl: './topselling.component.css',
})
export class TopsellingComponent implements OnInit {
  products: Product[] = [];
  highestSoldProduct: Product | null = null;

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

          this.highestSoldProduct = this.products.reduce((max, product) => {
            return (max.total_sold || 0) < (product.total_sold || 0)
              ? product
              : max;
          }, this.products[0] || null);
        }
      },
    });
  }

  viewProduct(id: any) {
    this.router.navigate([`user/product-detail/${id}`]);
  }
}
