import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-cards.component.html',
  styleUrl: './product-cards.component.css',
})
export class ProductCardsComponent implements OnInit {
  products: any[] = [];
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe((res) => {
      this.products = res.products;
      console.log('Products:', JSON.stringify(this.products, null, 2));
    });
  }
}
