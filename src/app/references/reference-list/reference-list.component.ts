import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FirebaseService } from '../../core/services/firebase.service';
import { Reference } from '../models/reference.interface';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reference-list',
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ]
})
export class ReferenceListComponent implements OnInit {
  references: Reference[] = [];
  displayedColumns: string[] = ['timestamp', 'entityType', 'action', 'changeDescription'];
  isLoading = false;

  constructor(
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadReferences();
  }

  async loadReferences() {
    try {
      this.isLoading = true;
      const refs = await this.firebaseService.getUserReferences();
      this.references = refs as Reference[];
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error loading references', 'Close', {
        duration: 3000
      });
    } finally {
      this.isLoading = false;
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'create':
        return 'primary';
      case 'update':
        return 'accent';
      case 'delete':
        return 'warn';
      default:
        return '';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'create':
        return 'add_circle';
      case 'update':
        return 'edit';
      case 'delete':
        return 'delete';
      default:
        return 'info';
    }
  }

  getActionTooltip(action: string): string {
    switch (action) {
      case 'create':
        return 'Item was created';
      case 'update':
        return 'Item was modified';
      case 'delete':
        return 'Item was deleted';
      default:
        return '';
    }
  }

  getEntityTypeColor(type: string): string {
    return type === 'task' ? 'primary' : 'accent';
  }

  getEntityTypeTooltip(type: string): string {
    switch (type) {
      case 'task':
        return 'Task-related activity';
      case 'profile':
        return 'Profile-related activity';
      default:
        return '';
    }
  }

  formatEntityType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  formatAction(action: string): string {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }

  formatDate(timestamp: any): string {
    if (timestamp?.toDate) {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    return new Date(timestamp).toLocaleString();
  }
}