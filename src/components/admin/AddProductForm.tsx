// src/components/AddProductForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox" // <-- Import Checkbox
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'sonner';

// Updated schema to handle the optional service charge
const productSchema = z.object({
  name: z.string().min(3, 'Vaccine name must be at least 3 characters.'),
  price: z.coerce.number({
      invalid_type_error: "Price must be a number.",
    })
    .min(0, 'Price must be a positive number.')
    .finite('Price must be a valid number.'),
  category: z.enum(['Dog', 'Cat', 'Both'], {
    required_error: 'Please select a category.',
  }),
  includeServiceCharge: z.boolean().default(false).optional(),
  serviceCharge: z.coerce.number({
    invalid_type_error: "Service charge must be a number.",
  }).min(0).optional(),
}).refine(data => {
  // If includeServiceCharge is true, serviceCharge must be a valid number
  if (data.includeServiceCharge && (data.serviceCharge === undefined || data.serviceCharge < 0)) {
    return false;
  }
  return true;
}, {
  message: "Service charge is required when included.",
  path: ["serviceCharge"], // a a validation error on the serviceCharge field
});


type ProductFormValues = z.infer<typeof productSchema>;

// The data sent to Firestore will be cleaned in the onSubmit function
const addProduct = async (product: Partial<ProductFormValues>) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
  });
  return docRef;
};

interface AddProductFormProps {
  onSuccess?: () => void;
}

const AddProductForm = ({ onSuccess }: AddProductFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: undefined,
      includeServiceCharge: false,
      serviceCharge: 300, // <-- Default service charge value
    },
  });
  
  // Watch the checkbox value to conditionally render the input
  const includeServiceCharge = form.watch('includeServiceCharge');

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success('Product added successfully!');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    // Prepare the payload for Firestore
    const payload: Partial<ProductFormValues> = {
      name: data.name,
      price: data.price,
      category: data.category,
    };
    
    // Only include serviceCharge if the checkbox is checked
    if (data.includeServiceCharge) {
      payload.serviceCharge = data.serviceCharge;
    }

    mutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vaccine Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Rabies Booster" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (INR)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 500.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Both">Both (Dog & Cat)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Service Charge Checkbox */}
        <FormField
          control={form.control}
          name="includeServiceCharge"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Include Service Charge
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        {/* Service Charge Input (Conditional) */}
        {includeServiceCharge && (
          <FormField
            control={form.control}
            name="serviceCharge"
            render={({ field }) => (
              <FormItem className="animate-in fade-in">
                <FormLabel>Service Charge (INR)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
          {mutation.isPending ? 'Adding...' : 'Add Product'}
        </Button>
      </form>
    </Form>
  );
};

export default AddProductForm;