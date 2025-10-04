import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData,
  doc,
  updateDoc,
  query,
  where,
  docData
} from '@angular/fire/firestore';
import { Employee } from '../models/employee.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private firestore: Firestore) {}

//   async createEmployee(employee: Omit<Employee, 'id'>): Promise<string> {
//   const usersRef = collection(this.firestore, 'users');
//   const docRef = await addDoc(usersRef, {
//     ...employee,
//     userType: 'employee',
//     createdAt: new Date()
//   });
//   return docRef.id;
// }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<void> {
  const employeeDoc = doc(this.firestore, `users/${id}`);
  await updateDoc(employeeDoc, {
    ...employee,
    updatedAt: new Date()
  });
}

  getEmployeeById(id: string): Observable<Employee> {
    const employeeDoc = doc(this.firestore, `users/${id}`);
    return docData(employeeDoc, { idField: 'id' }) as Observable<Employee>;
  }

  getEmployees(): Observable<Employee[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('userType', '==', 'employee'));
    return collectionData(q, { idField: 'id' }) as Observable<Employee[]>;
  }

  // getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
  //   const usersRef = collection(this.firestore, 'users');
  //   const q = query(
  //     usersRef, 
  //     where('departmentId', '==', departmentId),
  //     where('userType', '==', 'employee')
  //   );
  //   return collectionData(q, { idField: 'id' }) as Observable<Employee[]>;
  // }
}