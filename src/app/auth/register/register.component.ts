// src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../auth.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.firebaseService.signUp(email, password)
        .then(() => {
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 5000 });
          this.router.navigate(['/auth/login']);
        })
        .catch(error => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
        });
    }
  }
}