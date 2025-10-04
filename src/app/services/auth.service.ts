import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { first } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private roleSubject = new BehaviorSubject<'admin' | 'employee' | null>(null);
  private departmentSubject = new BehaviorSubject<number | null>(null);
  private fullNameSubject = new BehaviorSubject<string | null>(null);

  private userLoadedSubject = new BehaviorSubject<boolean>(false);
  isUserLoaded$ = this.userLoadedSubject.asObservable();

  constructor(
    private router: Router, 
    private auth: Auth,
    private firestore: Firestore
  ) { 
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.roleSubject.next(userData['userType']);
            this.departmentSubject.next(userData['departmentId']);
            this.fullNameSubject.next(userData['name']);
          }
          this.router.navigate(['/dashboard']);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        this.roleSubject.next(null);
        this.departmentSubject.next(null);
        this.fullNameSubject.next(null);
      }
      
      this.userSubject.next(user);
      this.userLoadedSubject.next(true);
    });
  }

  async signup(
    email: string, 
    password: string, 
    name: string, 
    departmentId: number,
    address: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userDoc = doc(this.firestore, `users/${userCredential.user.uid}`);
      await setDoc(userDoc, {
        id: userCredential.user.uid,
        name,
        email,
        userType: 'employee',
        departmentId,
        address,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    await this.isUserLoaded$.pipe(first(loaded => loaded === true)).toPromise();
  }

  logout() {
    signOut(this.auth).then(() => this.router.navigate(['/login']));
  }

  user$: Observable<User | null> = this.userSubject.asObservable();
  role$: Observable<'admin' | 'employee' | null> = this.roleSubject.asObservable();
  department$: Observable<number | null> = this.departmentSubject.asObservable();
  fullName$: Observable<string | null> = this.fullNameSubject.asObservable();

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  getCurrentUserRole(): 'admin' | 'employee' | null {
    return this.roleSubject.value;
  }

  getCurrentUserDepartment(): number | null {
    return this.departmentSubject.value;
  }

  getFullName(): string | null {
    return this.fullNameSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  async getCurrentUserData(): Promise<Employee | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
    return userDoc.exists() ? userDoc.data() as Employee : null;
  }
}