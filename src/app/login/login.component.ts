import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  login(): void {
    this.errorMessage = '';

    // Temporary credentials because the internship says no database
    if (
      this.username === 'admin123' &&
      this.password === '123456'
    ) {
      localStorage.setItem('username', this.username);

      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Invalid credentials';
    }
  }
}