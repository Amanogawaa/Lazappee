import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../service/products.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    private builder: FormBuilder,
    private service: ProductsService,
    private router: Router
  ) {
    sessionStorage.clear();
  }

  loginForm = this.builder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  passwordFieldType: string = 'password';

  ngOnInit(): void {}

  loginStudent() {
    if (this.loginForm.valid) {
      this.service.loginStudent(this.loginForm.value).subscribe(
        (res: any) => {
          if (res.token) {
            sessionStorage.setItem('token', res.token);
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Signed in successfully',
            });
            this.router.navigate(['user']);
          }
        },
        (error) => {
          if (error.status == 401) {
            Swal.fire({
              title: 'Error',
              text: 'Invalid Credentials. Please try again.',
              icon: 'error',
            });
          }
          if (error.status == 404) {
            Swal.fire({
              title: 'User does not exist!',
              text: 'Please double check your entered email.',
              icon: 'error',
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Missing login credentials.',
      });
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
