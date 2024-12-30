import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { FirebaseService } from '../../core/services/firebase.service';
import { Task, TaskStatus } from '../models/task.interface';
import { take } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

// Define the date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
  isEditMode: boolean = false;
  isSaving: boolean = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Task | null
  ) {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      dueDate: [new Date(), Validators.required],
      status: ['Pending', Validators.required]
    });

    if (data) {
      this.isEditMode = true;
      this.taskForm.patchValue({
        name: data.name,
        description: data.description,
        dueDate: new Date(data.dueDate),
        status: data.status
      });
    }
  }

  ngOnInit() {}

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  async onSubmit() {
    if (this.taskForm.valid && !this.isSaving) {
      try {
        this.isSaving = true;
        const user = await this.firebaseService.getCurrentUser().pipe(take(1)).toPromise() as User;
        if (!user?.uid) throw new Error('User not authenticated');

        const taskData: Partial<Task> = {
          name: this.taskForm.value.name.trim(),
          description: this.taskForm.value.description.trim(),
          dueDate: this.taskForm.value.dueDate.toISOString(),
          status: this.taskForm.value.status as TaskStatus,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        };

        if (this.isEditMode && this.data?.id) {
          await this.firebaseService.updateTask(this.data.id, taskData);
          this.showSuccessMessage('Task updated successfully');
        } else {
          taskData.createdAt = new Date().toISOString();
          await this.firebaseService.createTask(user.uid, taskData);
          this.showSuccessMessage('Task created successfully');
        }

        this.dialogRef.close(true);
      } catch (error: any) {
        console.error('Error saving task:', error);
        this.showErrorMessage(error.message || 'Error saving task');
      } finally {
        this.isSaving = false;
      }
    }
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}