import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  private API_URL = 'http://localhost/Lazappee/backend/api/';

  getAllProducts(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}products`);
  }

  addToCart(
    productId: number,
    quantity: number,
    userId: number
  ): Observable<any> {
    const data = {
      product_id: productId,
      quantity: quantity,
      user_id: userId,
    };
    return this.http.post<any>(`${this.API_URL}addtocart`, data);
  }
}
