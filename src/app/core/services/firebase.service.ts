// src/app/core/services/firebase.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user
} from '@angular/fire/auth';
import { 
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  
  // Auth methods
  getCurrentUser() {
    return user(this.auth);
  }

  async signUp(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // Create user profile in Firestore
      await this.createUserProfile(result.user.uid, {
        email,
        createdAt: new Date().toISOString()
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signOut() {
    return signOut(this.auth);
  }

  // Firestore methods
  async createUserProfile(userId: string, data: any) {
    const userRef = doc(this.firestore, 'users', userId);
    return setDoc(userRef, data);
  }

  async updateUserProfile(userId: string, data: any) {
    const userRef = doc(this.firestore, 'users', userId);
    return updateDoc(userRef, data);
  }

  async createTask(userId: string, taskData: any) {
    const tasksRef = collection(this.firestore, 'tasks');
    const taskDoc = doc(tasksRef);
    return setDoc(taskDoc, {
      ...taskData,
      userId,
      createdAt: new Date().toISOString()
    });
  }

  async getUserTasks(userId: string) {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async updateTask(taskId: string, data: any) {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    return updateDoc(taskRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteTask(taskId: string) {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    return deleteDoc(taskRef);
  }
}