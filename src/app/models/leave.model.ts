export interface Leave {
  id: string;
  employeeId: string;
  employeeName?: string;  
  leaveTypeId: string;
  leaveTypeName: string;
  from: Date;
  to: Date;
  numberOfDays: number;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
export interface LeaveType {
  id: string;
  name: string;
}