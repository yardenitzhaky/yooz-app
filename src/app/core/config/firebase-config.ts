// src/app/core/config/firebase-config.ts
import { connectFirestoreEmulator } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

export function setupFirestore(firestore: Firestore) {
  if (environment.useEmulators) {
    console.log('Connecting to Firestore emulator');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  }
  return firestore;
}