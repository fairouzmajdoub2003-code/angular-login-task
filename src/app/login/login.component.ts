import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

interface LoginResponse {
  success: boolean;
  message: string;
  username: string;
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  private readonly loginUrl = 'http://localhost:3000/api/login';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(loginForm: NgForm): void {
    this.errorMessage = '';

    if (loginForm.invalid) {
      loginForm.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.http.post<LoginResponse>(this.loginUrl, {
      username: this.username.trim(),
      password: this.password
    }).subscribe(
      (response: LoginResponse) => {
        localStorage.setItem('username', response.username);
        localStorage.setItem('token', response.token);

        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      (error: HttpErrorResponse) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to the backend server.';
        } else if (error.status === 401) {
          this.errorMessage = 'Error: invalid credential';
        } else {
          this.errorMessage =
            error.error?.message || 'Login failed';
        }
      }
    );
  }
}