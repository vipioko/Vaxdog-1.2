// src/components/booking/Step4Confirmation.tsx

import React from 'react';
import { Reminder } from '@/data/mock';
import { AvailableSlot } from '@/hooks/useAvailableSlots';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, MapPin, Syringe, IndianRupee } from 'lucide-react';
import { Vaccine } from '../BookingFormDialog'; // <-- Make sure this type is updated

interface Step4ConfirmationProps {
  formValues: any;
  reminder: Reminder;
  selectedSlot: AvailableSlot;
  selectedVaccines?: Vaccine[];
}

const Step4Confirmation: React.FC<Step4ConfirmationProps> = ({ formValues, reminder, selectedSlot, selectedVaccines = [] }) => {
  // Same calculation logic as Step 3
  const vaccineTotal = selectedVaccines.reduce((sum, vaccine) => sum + vaccine.price, 0);
  const serviceChargeTotal = selectedVaccines.reduce((sum, vaccine) => sum + (vaccine.serviceCharge || 0), 0);
  const totalFee = vaccineTotal + serviceChargeTotal;

  return (
    <div className="space-y-3 animate-in fade-in">
      <h3 className="text-lg font-semibold text-center mb-4 text-white">Confirm Your Booking</h3>
      
      <Card className="bg-slate-700/30 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base text-white">
            <Syringe className="mr-2 h-4 w-4 text-purple-400" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {selectedVaccines.length > 0 ? (
            <>
              <p className="text-white"><strong>For Pet:</strong> {reminder.dog}</p>
              <div className="border-t border-slate-600 pt-2 mt-2 space-y-1">
                <p className="font-semibold text-white">Cost Breakdown:</p>
                <ul className="list-none space-y-1 text-slate-300">
                  {/* List vaccine prices */}
                  {selectedVaccines.map((vaccine, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{vaccine.label}</span>
                      <div className="flex items-center">
                        <IndianRupee className="h-3 w-3 mr-0.5" />
                        {vaccine.price.toFixed(2)}
                      </div>
                    </li>
                  ))}
                  
                  {/* List total service charge if applicable */}
                  {serviceChargeTotal > 0 && (
                    <li className="flex justify-between">
                      <span>Service Charge(s)</span>
                      <div className="flex items-center">
                        <IndianRupee className="h-3 w-3 mr-0.5" />
                        {serviceChargeTotal.toFixed(2)}
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              <div className="border-t border-slate-600 pt-2 mt-2">
                <p className="flex justify-between font-bold text-base text-white">
                  <span>Total Fee:</span>
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {totalFee.toFixed(2)}
                  </div>
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-white"><strong>Vaccine:</strong> N/A</p>
              <p className="text-white"><strong>For:</strong> {reminder.dog}</p>
              <p className="font-bold mt-2 text-white">Fee: ₹0</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* The rest of the component remains the same */}
      <div className="space-y-3">
        <Card className="bg-slate-700/30 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base text-white">
              <Calendar className="mr-2 h-4 w-4 text-purple-400" />
              Booking Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium text-white">{format(selectedSlot.datetime.toDate(), 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-slate-400">{format(selectedSlot.datetime.toDate(), 'h:mm a')}</p>
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
            <p className="font-semibold text-white">{formValues.name}</p>
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
    </div>
  );
};

export default Step4Confirmation;