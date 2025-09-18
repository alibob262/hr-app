export interface Employee {
  id: string;           
  name: string;
  email: string;
  address: string;
  departmentId: number;
  createdAt: Date;      
  updatedAt?: Date;     
  isActive: boolean;    
}