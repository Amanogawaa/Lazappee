import { SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  stock: number;
  price: number;
  categories: string[];
  product_image$: Observable<SafeResourceUrl | undefined>;
}
