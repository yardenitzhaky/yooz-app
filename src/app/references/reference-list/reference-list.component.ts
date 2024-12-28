// src/app/references/reference-list/reference-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FirebaseService } from '../../core/services/firebase.service';

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
    MatSnackBarModule
  ]
})
export class ReferenceListComponent implements OnInit {
  references: any[] = [];
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
      this.references = await this.firebaseService.getUserReferences();
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

  getEntityTypeColor(type: string): string {
    return type === 'task' ? 'primary' : 'accent';
  }

  formatDate(timestamp: any): string {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  }
}