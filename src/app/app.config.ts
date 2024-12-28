// src/app/app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

import { initializeApp } from '@angular/fire/app';
import { getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  initializeFirestore
} from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebase);
      return app;
    }),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideFirestore(() => {
      // Initialize Firestore with settings
      const app = getAuth().app;
      const firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      });
      
      // Connect to emulator if in development
      if (environment.useEmulators) {
        console.log('Connecting to Firestore emulator');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      
      return firestore;
    })
  ]
};