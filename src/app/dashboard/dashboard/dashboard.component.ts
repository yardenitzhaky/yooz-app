import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@angular/fire/auth';

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
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  pageTitle = '';
  displayName: string | null = null;
  userEmail: string | null = null;
  userPhotoUrl: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.firebaseService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.displayName = user.displayName;
        this.userEmail = user.email;
        this.userPhotoUrl = user.photoURL;
      }
    });
  }

  async onLogout() {
    try {
      await this.firebaseService.signOut();
      this.snackBar.open('Logged out successfully', 'Close', {
        duration: 3000
      });
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Logout failed', 'Close', {
        duration: 3000
      });
    }
  }
}