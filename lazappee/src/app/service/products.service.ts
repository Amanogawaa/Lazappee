import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  API_URL = 'http://localhost/Lazappee/backend/api/';

  constructor(private http: HttpClient, private helper: JwtHelperService) {}

  //post
  loginStudent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}login`, data);
  }

  registerStudent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}adduser`, data);
  }

  addToCart(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}addtocart`, data);
  }

  buyNow(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}buynow`, data);
  }

  //get
  getCurrentUserId(): number | null {
    const mytoken = sessionStorage.getItem('token');
    if (mytoken) {
      const decodedToken = this.helper.decodeToken(mytoken);
      if (decodedToken && decodedToken.id) {
        return decodedToken.id;
      }
    }
    return null;
  }

  getUserCart(): number | null {
    const mytoken = sessionStorage.getItem('token');
    if (mytoken) {
      const decodedToken = this.helper.decodeToken(mytoken);
      if (decodedToken && decodedToken.cart_id) {
        return decodedToken.cart_id;
      }
    }
    return null;
  }

  getAllProducts(id = null): Observable<any> {
    if (id) {
      return this.http.get<any>(`${this.API_URL}products/${id}`);
    } else {
      return this.http.get<any>(`${this.API_URL}products`);
    }
  }

  getUserItems(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}cartitems/${id}`);
  }
}
