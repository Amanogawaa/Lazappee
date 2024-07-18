import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  emailInvalid: boolean = false;

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private router: Router
  ) {}

  registerForm = this.builder.group({
    first_name: this.builder.control('', Validators.required),
    last_name: this.builder.control('', Validators.required),
    username: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required])),
    password: this.builder.control('', Validators.required),
  });

  registerUser(): void {
    if (this.registerForm.valid) {
      this.service.registerUser(this.registerForm.value).subscribe(
        (result) => {
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
}
