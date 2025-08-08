import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface Step2ContactFormProps {
  control: Control<any>;
}

const Step2ContactForm: React.FC<Step2ContactFormProps> = ({ control }) => {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  {...field} 
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+91 98765 43210" 
                  {...field} 
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Address</FormLabel>
            <FormControl>
              <Input 
                placeholder="123, Main Street" 
                {...field} 
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">City</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Mumbai" 
                  {...field} 
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Postal Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="400001" 
                  {...field} 
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default Step2ContactForm;