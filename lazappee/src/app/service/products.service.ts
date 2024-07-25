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

  removeToCart(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}removetocart`, data);
  }

  buyNow(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}buynow`, data);
  }

  orderItem(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}orderitem`, data);
  }

  cancelOrderItem(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}cancelorder`, data);
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

  getAllProducts(
    categoryId: number | null = null,
    id: number | null = null
  ): Observable<any> {
    let url = `${this.API_URL}products`;

    if (id) {
      url += `/${id}`;
    }

    if (categoryId !== null) {
      if (url.includes('?')) {
        url += `&categoryId=${categoryId}`;
      } else {
        url += `?categoryId=${categoryId}`;
      }
    }
    return this.http.get<any>(url);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getcategory`);
  }

  getUserItems(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}cartitems/${id}`);
  }

  getUserOrderItems(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}orderitems/${id}`);
  }

  getProductImage(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}getproductimage/${id}`, {
      responseType: 'blob',
    });
  }
}
