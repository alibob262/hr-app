import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ Add this

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'hr-app-86167',
        appId: '1:282023899596:web:965625b6be402f3d29ad69',
        storageBucket: 'hr-app-86167.firebasestorage.app',
        apiKey: 'AIzaSyCo4ReFAtiYL5aRMUOS7WK6j6KKGNUQ_fs',
        authDomain: 'hr-app-86167.firebaseapp.com',
        messagingSenderId: '282023899596',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideAnimations(), 
  ],
};
