import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductsService } from '../service/products.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  constructor(
    private builder: FormBuilder,
    private service: ProductsService,
    private router: Router
  ) {
    sessionStorage.clear();
  }

  registerForm = this.builder.group({
    first_name: this.builder.control('', Validators.required),
    last_name: this.builder.control('', Validators.required),
    username: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required])),
    password: this.builder.control('', Validators.required),
  });

  passwordFieldType: string = 'password';

  registerStudent(): void {
    if (this.registerForm.valid) {
      this.service.registerStudent(this.registerForm.value).subscribe(
        (result) => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
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
            title: 'Registered in successfully',
          });
          this.router.navigate(['login']);
        },
        (error) => {
          Swal.fire('Warning', `${error.error.status.message}`, 'warning');
        }
      );
    } else {
      Swal.fire('Incomplete Data', 'Please fill in all fields', 'warning');
    }
  }
  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
