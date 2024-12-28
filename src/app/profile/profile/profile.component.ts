import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseService } from '../../core/services/firebase.service';
import { take } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

interface ProfileFormValue {
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

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
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  originalFormValue: ProfileFormValue | null = null;

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
    this.loadUserData();
  }

  private async loadUserData() {
    try {
      const user = await this.firebaseService.getCurrentUser().pipe(take(1)).toPromise() as User | null;
      if (user) {
        const formValue: ProfileFormValue = {
          displayName: user.displayName || '',
          email: user.email || '',
          currentPassword: '',
          newPassword: ''
        };
        
        this.profileForm.patchValue(formValue);
        this.originalFormValue = formValue;
      }
    } catch (error) {
      this.snackBar.open('Error loading user data', 'Close', { duration: 3000 });
    }
  }

  async onSubmit() {
    if (this.profileForm.valid && this.profileForm.dirty) {
      try {
        const formValue = this.profileForm.value as ProfileFormValue;
        const updates: Promise<any>[] = [];
        
        // Collect all updates
        if (this.profileForm.get('displayName')?.dirty) {
          updates.push(
            this.firebaseService.updateProfile({ displayName: formValue.displayName })
          );
        }

        if (this.profileForm.get('email')?.dirty) {
          updates.push(
            this.firebaseService.updateEmail(formValue.email)
          );
        }

        if (formValue.currentPassword && formValue.newPassword) {
          updates.push(
            this.firebaseService.updatePassword(formValue.currentPassword, formValue.newPassword)
          );
        }

        // Execute all updates
        await Promise.all(updates);

        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.profileForm.markAsPristine();
        
        // Update original form value
        this.originalFormValue = {
          ...formValue,
          currentPassword: '',
          newPassword: ''
        };
        
        // Reset password fields
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: ''
        });
      } catch (error: any) {
        this.snackBar.open(error.message || 'An error occurred', 'Close', { duration: 5000 });
      }
    }
  }

  resetForm() {
    if (this.originalFormValue) {
      this.profileForm.patchValue(this.originalFormValue);
      this.profileForm.markAsPristine();
      this.snackBar.open('Form has been reset', 'Close', { duration: 3000 });
    }
  }
}