// src/components/booking/Step3VaccineSelection.tsx

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Vaccine } from '../BookingFormDialog';
import { IndianRupee, Plus } from 'lucide-react';
import { MultiSelect, Option } from '@/components/ui/multi-select';

interface Step3VaccineSelectionProps {
  control: Control<any>;
  vaccines: Vaccine[];
}

const Step3VaccineSelection: React.FC<Step3VaccineSelectionProps> = ({ control, vaccines }) => {
  const selectedVaccines = useWatch({
    control,
    name: 'vaccines',
    defaultValue: [],
  });

  const vaccineOptions: Option[] = vaccines.map(vaccine => ({
    label: vaccine.label,
    value: vaccine.value,
    price: vaccine.price,
    serviceCharge: vaccine.serviceCharge, // Pass it along
  }));

  const selectedVaccineItems = vaccines.filter(v => selectedVaccines.includes(v.value));

  // Updated cost calculation
  const vaccineTotal = selectedVaccineItems.reduce((sum, vaccine) => sum + vaccine.price, 0);
  const serviceChargeTotal = selectedVaccineItems.reduce((sum, vaccine) => sum + (vaccine.serviceCharge || 0), 0);
  const totalAmount = vaccineTotal + serviceChargeTotal;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="vaccines"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white">Select Vaccines</FormLabel>
            {vaccines.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-slate-700/30 border-slate-600">
                <p className="text-slate-400 text-sm mb-2">No vaccines available for this pet type.</p>
                <p className="text-xs text-slate-500">Please contact admin to add vaccines for your pet category.</p>
              </div>
            ) : (
              <FormControl>
                <MultiSelect
                  options={vaccineOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Search and select vaccines..."
                  className="w-full"
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedVaccineItems.length > 0 && (
        <Card className="animate-fade-in bg-slate-700/30 border-slate-600">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">Price breakdown:</p>
              
              {/* Detailed Breakdown */}
              <div className="space-y-2 text-sm">
                {selectedVaccineItems.map((vaccine) => (
                  <div key={vaccine.value} className="bg-slate-600/50 rounded-lg p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white">{vaccine.label}</span>
                      <div className="flex items-center text-slate-300">
                        <IndianRupee className="h-3 w-3 mr-0.5" />
                        {vaccine.price.toFixed(2)}
                      </div>
                    </div>
                    {vaccine.serviceCharge && vaccine.serviceCharge > 0 && (
                       <div className="flex justify-between items-center text-xs text-slate-400 pl-2">
                        <span>+ Service Charge</span>
                        <div className="flex items-center">
                          <IndianRupee className="h-2.5 w-2.5 mr-0.5" />
                          {vaccine.serviceCharge.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="border-t border-slate-600 pt-3 mt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <div className="flex items-center text-white">
                     <IndianRupee className="h-3.5 w-3.5 mr-1" />
                     {vaccineTotal.toFixed(2)}
                  </div>
                </div>
                 {serviceChargeTotal > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Service Charges</span>
                      <div className="flex items-center text-white">
                         <IndianRupee className="h-3.5 w-3.5 mr-1" />
                         {serviceChargeTotal.toFixed(2)}
                      </div>
                    </div>
                 )}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-white">Total Amount</span>
                  <div className="flex items-center text-purple-400">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Step3VaccineSelection;