import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private helper: JwtHelperService) {}

  API_URL = 'http://localhost/Lazappee/backend/api/';

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

  loginUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}login`, data);
  }

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}adduser`, data);
  }
}
