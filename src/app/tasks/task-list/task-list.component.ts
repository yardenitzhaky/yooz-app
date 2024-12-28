import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../core/services/firebase.service';
import { Task, TaskStatus } from '../models/task.interface';
import { TaskFormComponent } from '../task-form/task-form.component';
import { take } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { trigger, transition, style, animate } from '@angular/animations';

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
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  animations: [
    trigger('taskAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TaskListComponent implements OnInit {
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;
  
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedStatus: TaskStatus | 'All' = 'All';
  statuses: (TaskStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed'];
  availableStatuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
  isLoading = false;

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
      this.isLoading = true;
      const user = await this.firebaseService.getCurrentUser().pipe(take(1)).toPromise() as User;
      if (user?.uid) {
        const tasks = await this.firebaseService.getUserTasks(user.uid);
        this.tasks = tasks.sort((a, b) => {
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        });
        this.filterTasks();
      }
    } catch (error: any) {
      this.showError(error.message || 'Error loading tasks');
    } finally {
      this.isLoading = false;
    }
  }

  filterTasks() {
    this.filteredTasks = this.selectedStatus === 'All'
      ? this.tasks
      : this.tasks.filter(task => task.status === this.selectedStatus);
  }

  openTaskDialog(task?: Task) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: task,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  confirmDelete(task: Task) {
    const dialogRef = this.dialog.open(this.deleteConfirmDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTask(task.id!);
      }
    });
  }

  async deleteTask(taskId: string) {
    try {
      await this.firebaseService.deleteTask(taskId);
      this.showSuccess('Task deleted successfully');
      await this.loadTasks();
    } catch (error: any) {
      this.showError(error.message || 'Error deleting task');
    }
  }

  async updateTaskStatus(task: Task, newStatus: TaskStatus) {
    try {
      await this.firebaseService.updateTask(task.id!, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      this.showSuccess(`Task marked as ${newStatus}`);
      await this.loadTasks();
    } catch (error: any) {
      this.showError(error.message || 'Error updating task status');
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'All':
        return 'list';
      case 'Pending':
        return 'schedule';
      case 'In Progress':
        return 'trending_up';
      case 'Completed':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  isDueSoon(date: string | Date): boolean {
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  isOverdue(date: string | Date): boolean {
    const dueDate = new Date(date);
    const today = new Date();
    return dueDate < today;
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}