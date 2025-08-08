
import React from 'react';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import TimeSlotPicker from '../TimeSlotPicker';
import { AvailableSlot } from '@/hooks/useAvailableSlots';
import { Control } from 'react-hook-form';

interface Step1SlotPickerProps {
  control: Control<any>;
  availableSlots: AvailableSlot[];
  isLoading: boolean;
}

const Step1SlotPicker: React.FC<Step1SlotPickerProps> = ({ control, availableSlots, isLoading }) => {
  return (
    <div className="animate-in fade-in">
      <FormField
        control={control}
        name="slotId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <TimeSlotPicker
                availableSlots={availableSlots}
                selectedSlotId={field.value}
                onSlotSelect={field.onChange}
                isLoading={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step1SlotPicker;
