// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { take, map } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

export const authGuard = () => {
  const authService = inject(FirebaseService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};