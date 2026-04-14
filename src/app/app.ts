import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, finalize, take } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { AppDataService } from './core/app-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isPreloading = false;

  get authState$() {
    return this.authService.authState$;
  }

  constructor(private authService: AuthService, private appDataService: AppDataService) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(filter((isAuthenticated) => isAuthenticated))
      .subscribe(() => {
        this.isPreloading = true;
        this.appDataService.preloadAllData().pipe(finalize(() => (this.isPreloading = false))).subscribe();
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
