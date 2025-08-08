export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  imageUrl?: string;
  petType: string;
  dateOfBirth: string;
  // New enhanced fields
  aggressionLevel?: 'Low' | 'Medium' | 'High';
  weight?: number; // in kg
  sex?: 'Male' | 'Female';
  matingInterest?: boolean;
  pregnancyCount?: number; // Only for female pets
  pupCount?: number; // Only for female pets
  vaccinationScheduleImages?: string[]; // Multiple vaccination schedule images
}

export interface Reminder {
  id: string;
  dog: string;
  vaccine: string;
  due: string;
  status: 'upcoming' | 'completed';
  completedDate?: string;
}
