//src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../auth.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.firebaseService.signIn(email, password)
        .then(() => {
          this.router.navigate(['/dashboard']);
        })
        .catch(error => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
        });
    }
  }

  onGoogleSignIn() {
    this.firebaseService.signInWithGoogle()
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch(error => {
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
      });
  }
}