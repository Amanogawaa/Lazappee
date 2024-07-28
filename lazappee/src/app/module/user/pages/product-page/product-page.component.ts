import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProductsService } from '../../../../service/products.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';
import { Product } from '../../product';
import { FormatterPipe } from '../../../../pipe/formatter.pipe';
import { TopsellingComponent } from '../../component/topselling/topselling.component';
import { SalesComponent } from '../../component/sales/sales.component';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormatterPipe,
    TopsellingComponent,
    SalesComponent,
  ],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductPageComponent implements OnInit {
  products: Product[] = [];
  categories: any[] = [];
  item = 12;
  p = 1;
  selectedCategoryId: number | null = null;

  constructor(
    private service: ProductsService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(categoryId: number | null = null) {
    this.service.getAllProducts(categoryId).subscribe({
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
        }
      },
    });
  }

  loadCategories() {
    this.service.getCategories().subscribe((res) => {
      this.categories = res;
    });
  }

  sortStock() {
    this.products.sort((a: any, b: any) => {
      return a.stock === 0 ? 1 : b.stock === 0 ? -1 : 0;
    });
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.loadProducts(categoryId);
  }

  reset() {
    this.loadProducts();
  }

  viewProduct(id: any) {
    this.router.navigate([`user/product-detail/${id}`]);
  }
}
