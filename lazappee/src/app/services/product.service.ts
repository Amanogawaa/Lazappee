import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  private API_URL = 'https://dummyjson.com/';

  getAllProducts(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}products`);
  }
}
