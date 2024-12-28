// src/app/core/services/firebase.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
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
  getDocs,
  addDoc,
  getDoc,
  orderBy
} from '@angular/fire/firestore';
import { Task } from '../../tasks/models/task.interface';
import { take } from 'rxjs/operators';

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

  private async getCurrentUserId(): Promise<string> {
    const user = await this.getCurrentUser().pipe(take(1)).toPromise() as User;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
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

  async signOut() {
    await signOut(this.auth);
  }

  // Google Sign-In
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      // Check if it's a new user and create a profile
      const userSnapshot = await getDocs(
        query(collection(this.firestore, 'users'), where('userId', '==', result.user.uid))
      );
      if (userSnapshot.empty) {
        await this.createUserProfile(result.user.uid, {
          email: result.user.email,
          createdAt: new Date().toISOString()
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Profile Update Methods
  async updateProfile(profileData: { displayName?: string; photoURL?: string }) {
    const user = this.auth.currentUser;
    if (user) {
      const oldProfileData = {
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      
      await firebaseUpdateProfile(user, profileData);
      await this.updateUserProfile(user.uid, profileData);
      
      // Log profile update
      await this.logChange(
        'profile',
        user.uid,
        'update',
        'Updated profile information',
        oldProfileData,
        profileData
      );
    }
  }

  async updateEmail(newEmail: string) {
    const user = this.auth.currentUser;
    if (user) {
      const oldEmail = user.email;
      await firebaseUpdateEmail(user, newEmail);
      await this.updateUserProfile(user.uid, { email: newEmail });
      
      // Log email update
      await this.logChange(
        'profile',
        user.uid,
        'update',
        'Updated email address',
        { email: oldEmail },
        { email: newEmail }
      );
    }
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const user = this.auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);
      
      // Log password update (without including actual passwords)
      await this.logChange(
        'profile',
        user.uid,
        'update',
        'Changed password',
        null,
        null
      );
    }
  }

  // Firestore methods
  async createUserProfile(userId: string, data: any) {
    const userRef = doc(this.firestore, 'users', userId);
    await setDoc(userRef, data);
    
    // Log profile creation
    await this.logChange(
      'profile',
      userId,
      'create',
      'Created user profile',
      null,
      { ...data, userId }
    );
  }

  async updateUserProfile(userId: string, data: any) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, data);
  }

  // Task methods with logging
  async createTask(userId: string, taskData: Partial<Task>) {
    try {
      const tasksRef = collection(this.firestore, 'tasks');
      const task = {
        ...taskData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(tasksRef, task);
      const newTask = { id: docRef.id, ...task };
      
      // Log task creation
      await this.logChange(
        'task',
        docRef.id,
        'create',
        `Created task: ${taskData.name}`,
        null,
        newTask
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(this.firestore, 'tasks');
      const q = query(tasksRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, data: Partial<Task>) {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      const originalTask = { id: taskDoc.id, ...taskDoc.data() } as Task;
      
      const updates = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(taskRef, updates);
      
      // Create description based on what was updated
      let changeDescription = 'Updated task';
      if (data.status) {
        changeDescription = `Changed status to ${data.status}`;
      } else if (data.name) {
        changeDescription = `Renamed task to ${data.name}`;
      }
      
      // Log task update
      await this.logChange(
        'task',
        taskId,
        'update',
        changeDescription,
        originalTask,
        { ...originalTask, ...updates }
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string) {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      const task = { id: taskDoc.id, ...taskDoc.data() } as Task;
      
      await deleteDoc(taskRef);
      
      // Log task deletion
      await this.logChange(
        'task',
        taskId,
        'delete',
        `Deleted task: ${task.name}`,
        task,
        null
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Reference logging methods
  private async logChange(
    entityType: 'task' | 'profile',
    entityId: string,
    action: 'create' | 'update' | 'delete',
    changeDescription: string,
    oldValue?: any,
    newValue?: any
  ) {
    try {
      const userId = await this.getCurrentUserId();
      
      const reference = {
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
    } catch (error) {
      console.error('Error logging change:', error);
      // Don't throw the error to prevent disrupting the main operation
    }
  }

  // Get references/activity log
  async getUserReferences() {
    try {
      const userId = await this.getCurrentUserId();
      
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
      }));
    } catch (error) {
      console.error('Error getting references:', error);
      throw error;
    }
  }
}