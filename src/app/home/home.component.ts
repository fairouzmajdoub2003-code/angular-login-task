import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  username = '';
  confirmingLogout = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Admin';
  }

  showLogoutConfirmation(): void {
    this.confirmingLogout = true;
  }

  confirmLogout(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }

  openColorGame(): void {
    this.router.navigate(['/color-game']);
  }
}