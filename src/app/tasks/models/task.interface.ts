// src/app/tasks/models/task.interface.ts
export interface Task {
    id?: string;
    name: string;
    description: string;
    dueDate: Date;
    status: TaskStatus;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';