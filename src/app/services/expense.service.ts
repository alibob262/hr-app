import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  addDoc,
  collectionData,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { take } from 'rxjs/operators';

import { ExpenseClaim, ExpenseClaimDetail } from '../models/expense.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  submitExpenseClaim(
    claim: Omit<ExpenseClaim, 'id'>,
    details: Omit<ExpenseClaimDetail, 'id' | 'claimId'>[]
  ): Promise<void> {
    const claimsRef = collection(this.firestore, 'expenseClaims');
    return addDoc(claimsRef, claim)
      .then(docRef => {
        const detailsRef = collection(
          this.firestore,
          `expenseClaims/${docRef.id}/details`
        );
        const detailPromises = details.map(detail =>
          addDoc(detailsRef, { ...detail, claimId: docRef.id })
        );
        return Promise.all(detailPromises);
      })
      .then(() => undefined);
  }

  getEmployeeClaims(employeeId: string): Observable<ExpenseClaim[]> {
    const claimsRef = collection(this.firestore, 'expenseClaims');
    const q = query(
      claimsRef,
      where('employeeId', '==', employeeId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ExpenseClaim[]>;
  }

  getAllClaims(): Observable<ExpenseClaim[]> {
    const claimsRef = collection(this.firestore, 'expenseClaims');
    return collectionData(claimsRef, { idField: 'id' }) as Observable<ExpenseClaim[]>;
  }

  getClaimDetails(claimId: string): Observable<ExpenseClaimDetail[]> {
    const detailsRef = collection(
      this.firestore,
      `expenseClaims/${claimId}/details`
    ) as CollectionReference<ExpenseClaimDetail>;

    return collectionData<ExpenseClaimDetail>(detailsRef, { idField: 'id' }).pipe(
      take(1)  
    );
  }

  getExpenseSummary(): Observable<{ name: string; value: number }[]> {
    return this.getAllClaims().pipe(
      // tap(claims => console.log('CLAIMS:', claims)),
      switchMap(claims => {
        if (!claims.length) {
          return of([]);
        }

        const allDetails$ = claims.map(c =>
          this.getClaimDetails(c.id!).pipe(
            // tap(details => console.log(`Details for ${c.id}:`, details)),
            map(details => ({ id: c.id!, details }))
          )
        );

        return forkJoin(allDetails$).pipe(
          map(results => {
            const summary = new Map<string, number>();

            results.forEach(({ details }) =>
              details.forEach(d => {
                // console.log('Processing detail:', d);
                if (d.type && d.total != null) {
                  summary.set(d.type, (summary.get(d.type) || 0) + d.total);
                }
              })
            );

            return Array.from(summary.entries()).map(([name, value]) => ({ name, value }));
          })
        );
      })
    );
  }
}
