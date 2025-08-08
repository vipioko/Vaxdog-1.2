export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number; // in years, can be decimal
  imageUrl?: string;
  petType: string;
  dateOfBirth: string;
  // Enhanced fields
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

export interface GroomingService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  imageUrl?: string;
  galleryImages?: string[];
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface PetHostelService {
  id: string;
  name: string;
  description: string;
  dailyRate: number;
  capacity: number;
  amenities?: string[];
  imageUrl?: string;
  galleryImages?: string[];
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface BaseBooking {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    landmark?: string;
  };
  petDetails: {
    name: string;
    breed: string;
    petType: string;
    dateOfBirth?: string;
    age?: number;
    aggressionLevel?: 'Low' | 'Medium' | 'High';
    weight?: number; // in kg
    sex?: 'Male' | 'Female';
  };
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface GroomingBooking extends BaseBooking {
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:MM
}

export interface PetHostelBooking extends BaseBooking {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  foodPreference?: 'veg' | 'non-veg' | 'both';
}