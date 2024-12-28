// src/app/profile/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Load current user data
    this.firebaseService.getCurrentUser().subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          displayName: user.displayName || '',
          email: user.email || ''
        });
      }
    });
  }

  async onSubmit() {
    if (this.profileForm.valid && this.profileForm.dirty) {
      try {
        const formValue = this.profileForm.value;
        
        // Update display name if changed
        if (this.profileForm.get('displayName')?.dirty) {
          await this.firebaseService.updateProfile({ displayName: formValue.displayName });
        }

        // Update email if changed
        if (this.profileForm.get('email')?.dirty) {
          await this.firebaseService.updateEmail(formValue.email);
        }

        // Update password if provided
        if (formValue.currentPassword && formValue.newPassword) {
          await this.firebaseService.updatePassword(formValue.currentPassword, formValue.newPassword);
        }

        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.profileForm.markAsPristine();
      } catch (error: any) {
        this.snackBar.open(error.message || 'An error occurred', 'Close', { duration: 5000 });
      }
    }
  }
}