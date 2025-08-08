import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDogs } from '@/hooks/useDogs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dog } from '@/data/mock';
import { Skeleton } from '@/components/ui/skeleton';

interface Step1PetSelectionProps {
  control: Control<any>;
}

const Step1PetSelection: React.FC<Step1PetSelectionProps> = ({ control }) => {
  const { dogs, isLoadingDogs } = useDogs();

  if (isLoadingDogs) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-white mb-2">No pets found</h3>
        <p className="text-slate-400 text-sm">Please add a pet to your profile before booking a service.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in">
      <FormField
        control={control}
        name="petId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Select Your Pet</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choose your pet" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {dogs.map((dog: Dog) => (
                    <SelectItem key={dog.id} value={dog.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={dog.imageUrl} alt={dog.name} />
                          <AvatarFallback className="bg-purple-500/20 text-purple-300">{dog.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{dog.name} ({dog.breed})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step1PetSelection;