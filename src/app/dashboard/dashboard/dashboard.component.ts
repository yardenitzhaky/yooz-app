// src/app/dashboard/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']

})
export class DashboardComponent {
  pageTitle = 'Dashboard';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onLogout() {
    try {
      await this.firebaseService.signOut();
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Logout failed', 'Close', {
        duration: 3000
      });
    }
  }
}