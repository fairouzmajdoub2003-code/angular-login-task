import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  username = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
  }

  openColorGame(): void {
    this.router.navigate(['/color-game']);
  }

  logout(): void {

    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
      localStorage.removeItem('username');
      this.router.navigate(['/login']);
    }

  }

}