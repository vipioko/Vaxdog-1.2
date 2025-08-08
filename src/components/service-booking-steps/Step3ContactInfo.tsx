import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';

interface Step3ContactInfoProps {
  control: Control<any>;
}

const Step3ContactInfo: React.FC<Step3ContactInfoProps> = ({ control }) => {
  const { user } = useAuth();
  const { setValue } = control._form; // Access setValue from the form instance

  useEffect(() => {
    if (user) {
      if (user.displayName) setValue('fullName', user.displayName);
      if (user.phoneNumber) setValue('phone', user.phoneNumber);
      // You might want to fetch and pre-fill address from a user profile if available
    }
  }, [user, setValue]);

  return (
    <div className="space-y-4 animate-in fade-in">
      <FormField
        control={control}
        name="fullName"
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

export default Step3ContactInfo;