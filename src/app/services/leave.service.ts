import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Leave, LeaveType } from '../models/leave.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private firestore: Firestore) {}

  // Leave Types
  getLeaveTypes(): Observable<LeaveType[]> {
    const leaveTypesRef = collection(this.firestore, 'leaveTypes');
    return collectionData(leaveTypesRef, { idField: 'id' }) as Observable<LeaveType[]>;
  }

  // Leaves
  submitLeave(leave: Omit<Leave, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const leavesRef = collection(this.firestore, 'leaves');
    return addDoc(leavesRef, {
      ...leave,
      from: Timestamp.fromDate(new Date(leave.from)),
      to: Timestamp.fromDate(new Date(leave.to)),
      status: 'pending',
      createdAt: Timestamp.now()
    }).then(() => {});
  }

  getEmployeeLeaves(employeeId: string): Observable<Leave[]> {
    const leavesRef = collection(this.firestore, 'leaves');
    const q = query(leavesRef, where('employeeId', '==', employeeId));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(leaves => {
        return leaves as Leave[];
      })
    );
  }

  calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  getAllLeaves(): Observable<Leave[]> {
    const leavesRef = collection(this.firestore, 'leaves');
    return collectionData(leavesRef, { idField: 'id' }) as Observable<Leave[]>;
  }

  getLeaveTypeSummary(): Observable<{name: string, value: number}[]> {
    return this.getAllLeaves().pipe(
      map(leaves => {
        const summary = new Map<string, number>();
        
        leaves.forEach(leave => {
          const current = summary.get(leave.leaveTypeName) || 0;
          summary.set(leave.leaveTypeName, current + leave.numberOfDays);
        });
        
        return Array.from(summary.entries()).map(([name, value]) => ({ name, value }));
      })
    );
  }

  updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected'): Promise<void> {
    const leaveDoc = doc(this.firestore, `leaves/${leaveId}`);
    return updateDoc(leaveDoc, { status });
  }
}