// src/app/references/services/reference.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { Reference } from '../models/reference.interface';
import { FirebaseService } from '../../core/services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  constructor(
    private firestore: Firestore,
    private firebaseService: FirebaseService
  ) {}

  async logChange(
    entityType: 'task' | 'profile',
    entityId: string,
    action: 'create' | 'update' | 'delete',
    changeDescription: string,
    oldValue?: any,
    newValue?: any
  ) {
    const userId = await this.firebaseService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const reference: Reference = {
      userId,
      entityType,
      entityId,
      action,
      changeDescription,
      timestamp: new Date(),
      oldValue,
      newValue
    };

    const referencesCollection = collection(this.firestore, 'references');
    await addDoc(referencesCollection, reference);
  }

  async getUserReferences() {
    const userId = await this.firebaseService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const referencesCollection = collection(this.firestore, 'references');
    const q = query(
      referencesCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Reference));
  }
}