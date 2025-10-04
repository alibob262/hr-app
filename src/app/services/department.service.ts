import { Injectable } from '@angular/core';
import { Department } from '../models/department.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private departments: Department[] = [
    { id: 1, name: 'Human Resources' },
    { id: 2, name: 'Finance' },
    { id: 3, name: 'Engineering' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Operations' },
    { id: 6, name: 'Sales' },
    { id: 7, name: 'Customer Support' }
  ];

  getDepartments(): Observable<Department[]> {
    return of(this.departments);
  }

  getDepartmentById(id: number | string): Department | undefined {
  const numericId = Number(id);
  return this.departments.find(dept => dept.id === numericId);
}
}
