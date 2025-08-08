import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, MapPin, IndianRupee, Dog, Clock, Home as HomeIcon, Utensils } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { GroomingService, PetHostelService, Dog as DogType } from '@/data/mock';

interface Step4ConfirmationProps {
  formValues: any;
  serviceType: 'grooming' | 'petHostel';
  service: GroomingService | PetHostelService;
  selectedPet: DogType;
}

const Step4Confirmation: React.FC<Step4ConfirmationProps> = ({ formValues, serviceType, service, selectedPet }) => {
  const calculateTotal = () => {
    if (serviceType === 'grooming') {
      return (service as GroomingService).price;
    } else if (serviceType === 'petHostel') {
      const hostelService = service as PetHostelService;
      const startDate = formValues.dateRange?.from;
      const endDate = formValues.dateRange?.to;
      if (startDate && endDate) {
        const days = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end day
        return days * hostelService.dailyRate;
      }
      return 0;
    }
    return 0;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="space-y-3 animate-in fade-in">
      <h3 className="text-lg font-semibold text-center mb-4 text-white">Confirm Your Booking</h3>

      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base text-white">
            <Dog className="mr-2 h-4 w-4 text-purple-400" />
            Pet & Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-white"><strong>Pet:</strong> {selectedPet.name} ({selectedPet.breed})</p>
          <p className="text-white"><strong>Service:</strong> {service.name}</p>
          {serviceType === 'grooming' && (
            <>
              <p className="text-white"><strong>Date:</strong> {formValues.preferredDate ? format(formValues.preferredDate, 'PPP') : 'N/A'}</p>
              <p className="text-white"><strong>Time:</strong> {formValues.preferredTime || 'N/A'}</p>
              <p className="text-white"><strong>Duration:</strong> {(service as GroomingService).duration} minutes</p>
            </>
          )}
          {serviceType === 'petHostel' && (
            <>
              <p className="text-white"><strong>Check-in:</strong> {formValues.dateRange?.from ? format(formValues.dateRange.from, 'PPP') : 'N/A'}</p>
              <p className="text-white"><strong>Check-out:</strong> {formValues.dateRange?.to ? format(formValues.dateRange.to, 'PPP') : 'N/A'}</p>
              <p className="text-white"><strong>Food Preference:</strong> {formValues.foodPreference || 'N/A'}</p>
            </>
          )}
          <div className="border-t border-slate-600 pt-2 mt-2">
            <div className="flex justify-between font-bold text-base text-white">
              <span>Total Fee:</span>
              <div className="flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base text-white">
            <User className="mr-2 h-4 w-4 text-purple-400" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-semibold text-white">{formValues.fullName}</p>
          <p className="text-slate-400">{formValues.phone}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base text-white">
            <MapPin className="mr-2 h-4 w-4 text-purple-400" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-white">{formValues.address}</p>
          <p className="text-slate-400">{formValues.city}, {formValues.postalCode}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step4Confirmation;