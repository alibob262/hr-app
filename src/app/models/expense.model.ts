import { Timestamp } from '@angular/fire/firestore';

export interface ExpenseClaim {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: Date | Timestamp;
  description: string;
  total: number;
  createdAt: Date | Timestamp;
  details?: ExpenseClaimDetail[];
}

export interface ExpenseClaimView extends ExpenseClaim {
  showDetails?: boolean;
  details?: ExpenseClaimDetail[]; 
}

export interface ExpenseClaimDetail {
  id?: string;
  claimId: string;
  date: Date | Timestamp;
  description: string;
  type: ExpenseType;
  total: number;
}

export type ExpenseType = 'hotel' | 'car rental' | 'food' | 'ticket';

export const EXPENSE_TYPES = [
  { id: 'hotel', name: 'Hotel' },
  { id: 'car rental', name: 'Car Rental' },
  { id: 'food', name: 'Food' },
  { id: 'ticket', name: 'Ticket' }
];