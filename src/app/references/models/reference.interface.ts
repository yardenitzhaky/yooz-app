// src/app/references/models/reference.interface.ts

export interface Reference {
    id?: string;
    userId: string;
    entityType: 'task' | 'profile'; // type of entity being modified
    entityId: string;
    action: 'create' | 'update' | 'delete'; // type of change
    changeDescription: string;
    timestamp: Date;
    oldValue?: any;
    newValue?: any;
  }