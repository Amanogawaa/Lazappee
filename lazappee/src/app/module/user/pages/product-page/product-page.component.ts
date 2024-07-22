import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';
import { Product } from '../../product';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
})
export class ProductPageComponent implements OnInit {
  products: Product[] = [];
  item = 12;
  p = 1;

  constructor(
    private service: ProductsService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.service.getAllProducts().subscribe({
      next: (result: any) => {
        console.log(result);
        if (result && Array.isArray(result)) {
          this.products = result.map((item) => ({
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
        }
      },
    });
  }

  sortStock() {
    this.products.sort((a: any, b: any) => {
      return a.stock === 0 ? 1 : b.stock === 0 ? -1 : 0;
    });
  }

  viewProduct(id: any) {
    this.router.navigate([`user/product-detail/${id}`]);
  }
}
