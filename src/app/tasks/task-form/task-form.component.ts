// src/app/tasks/task-form/task-form.component.ts
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

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Task | null
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
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

  async onSubmit() {
    if (this.taskForm.valid) {
      try {
        const user = await this.firebaseService.getCurrentUser().pipe(take(1)).toPromise() as User;
        if (!user?.uid) throw new Error('User not authenticated');

        const taskData: Partial<Task> = {
          name: this.taskForm.value.name,
          description: this.taskForm.value.description,
          dueDate: this.taskForm.value.dueDate.toISOString(),
          status: this.taskForm.value.status as TaskStatus,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (this.isEditMode && this.data?.id) {
          await this.firebaseService.updateTask(this.data.id, {
            ...taskData,
            updatedAt: new Date().toISOString()
          });
          this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
        } else {
          await this.firebaseService.createTask(user.uid, taskData);
          this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
        }

        this.dialogRef.close(true);
      } catch (error: any) {
        console.error('Error saving task:', error);
        this.snackBar.open(error.message || 'Error saving task', 'Close', { duration: 5000 });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}