// src/app/tasks/task-list/task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../core/services/firebase.service';
import { Task, TaskStatus } from '../models/task.interface';
import { TaskFormComponent } from '../task-form/task-form.component';
import { take } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSnackBarModule,
    FormsModule,
    MatNativeDateModule
  ],
  providers: [MatNativeDateModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedStatus: TaskStatus | 'All' = 'All';
  statuses: (TaskStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed'];
  availableStatuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  constructor(
    private firebaseService: FirebaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}


  ngOnInit() {
    this.loadTasks();
  }

  async loadTasks() {
    try {
      const user = await this.firebaseService.getCurrentUser().pipe(take(1)).toPromise() as User;
      if (user?.uid) {
        const tasks = await this.firebaseService.getUserTasks(user.uid);
        this.tasks = tasks as Task[];
        this.filterTasks();
      }
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error loading tasks', 'Close', { duration: 3000 });
    }
  }

  filterTasks() {
    this.filteredTasks = this.selectedStatus === 'All'
      ? this.tasks
      : this.tasks.filter(task => task.status === this.selectedStatus);
  }

  openTaskDialog(task?: Task) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  async deleteTask(taskId: string) {
    try {
      await this.firebaseService.deleteTask(taskId);
      this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
      await this.loadTasks();
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error deleting task', 'Close', { duration: 3000 });
    }
  }

  async updateTaskStatus(task: Task, newStatus: TaskStatus) {
    try {
      await this.firebaseService.updateTask(task.id!, { status: newStatus });
      this.snackBar.open('Task status updated', 'Close', { duration: 3000 });
      await this.loadTasks();
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error updating task', 'Close', { duration: 3000 });
    }
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'Pending': return 'warn';
      case 'In Progress': return 'primary';
      case 'Completed': return 'accent';
      default: return '';
    }
  }
}