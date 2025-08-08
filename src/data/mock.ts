export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  imageUrl?: string;
  petType: string;
  dateOfBirth: string;
}

export interface Reminder {
  id: string;
  dog: string;
  vaccine: string;
  due: string;
  status: 'upcoming' | 'completed';
  completedDate?: string;
}
