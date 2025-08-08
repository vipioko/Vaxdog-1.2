import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Reminder } from '@/data/mock';
import useRazorpay from '@/hooks/useRazorpay';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useProducts } from '@/hooks/useProducts';
import { useDogs } from '@/hooks/useDogs';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import Step1SlotPicker from './booking-steps/Step1SlotPicker';
import Step2ContactForm from './booking-steps/Step2ContactForm';
import Step3VaccineSelection from './booking-steps/Step3VaccineSelection';
import Step4Confirmation from './booking-steps/Step4Confirmation';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits.' })
    .regex(/^(\+91)?[6-9]\d{9}$/, { message: 'Invalid Indian phone number.' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  postalCode: z.string().min(6, { message: 'Postal code must be 6 digits.' }).max(6),
  slotId: z.string({ required_error: 'Please select a booking slot.' }),
  vaccines: z.array(z.string()).min(1, { message: 'Please select at least one vaccine.' }),
});

interface BookingFormDialogProps {
  reminder: Reminder;
  children: React.ReactNode;
}

export type Vaccine = { label: string; value: string; price: number; serviceCharge?: number; };

const RAZORPAY_KEY_ID = 'rzp_test_2n6MS8hK3tgdba';

const BookingFormDialog: React.FC<BookingFormDialogProps> = ({ reminder, children }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const isRazorpayLoaded = useRazorpay();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: availableSlots, isLoading: isLoadingSlots } = useAvailableSlots({ enabled: open });
  
  // Get the pet type from the reminder's dog data
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.name === reminder.dog);
  const petType = currentDog?.petType || 'Dog';
  
  console.log('Current dog:', currentDog);
  console.log('Pet type for products:', petType);
  
  const { data: products, isLoading: isLoadingProducts } = useProducts(petType);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      slotId: '',
      vaccines: [],
    },
  });
  
  const vaccineOptions: Vaccine[] = products?.map(p => ({
    label: p.name,
    value: p.id,
    price: p.price,
    serviceCharge: p.serviceCharge,
  })) ?? [];

  console.log('Vaccine options:', vaccineOptions);

  const selectedVaccineValues = form.watch('vaccines') || [];
  const selectedVaccines = vaccineOptions.filter(v => selectedVaccineValues.includes(v.value));
  
  // Updated cost calculation
  const vaccineTotal = selectedVaccines.reduce((sum, vaccine) => sum + vaccine.price, 0);
  const serviceChargeTotal = selectedVaccines.reduce((sum, vaccine) => sum + (vaccine.serviceCharge || 0), 0);
  const totalAmount = vaccineTotal + serviceChargeTotal;

  const handleNext = () => {
    if (step === 1 && !form.getValues('slotId')) {
      toast.error('Please select a booking slot');
      return;
    }
    if (step === 2) {
      const { name, phone, address, city, postalCode } = form.getValues();
      if (!name || !phone || !address || !city || !postalCode) {
        toast.error('Please fill in all contact details');
        return;
      }
    }
    if (step === 3 && selectedVaccines.length === 0) {
      toast.error('Please select at least one vaccine');
      return;
    }
    setStep(s => s + 1);
  };

  const handlePayment = async (values: z.infer<typeof formSchema>) => {
    console.log('Starting payment with values:', values);
    
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is not ready. Please try again in a moment.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to make a payment.');
      return;
    }
    
    const selectedSlot = availableSlots?.find(s => s.id === values.slotId);
    if (!selectedSlot) {
        toast.error("Selected slot is not available. Please choose another one.");
        return;
    }
    
    if (!selectedVaccines || selectedVaccines.length === 0) {
      toast.error("Please select at least one vaccine.");
      return;
    }

    const vaccineNames = selectedVaccines.map(v => v.label).join(', ');

    try {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: (totalAmount * 100).toString(),
        currency: 'INR',
        name: 'VaxDog - Home Vaccination',
        description: `Booking for ${vaccineNames} for ${reminder.dog}`,
        image: '/favicon.ico',
        handler: async function (response: any) {
          try {
            console.log('Payment successful, saving transaction:', response);
            const batch = writeBatch(db);
            
            const transactionCollectionRef = collection(db, 'users', user.uid, 'transactions');
            const newTransactionRef = doc(transactionCollectionRef);

            batch.set(newTransactionRef, {
              paymentId: response.razorpay_payment_id,
              amount: totalAmount,
              currency: 'INR',
              service: `Home Vaccination for ${vaccineNames} for ${reminder.dog}`,
              dogName: reminder.dog,
              vaccines: selectedVaccines.map(v => ({ name: v.label, price: v.price })),
              status: 'successful',
              createdAt: serverTimestamp(),
              customer: values,
              reminderId: reminder.id,
              slotId: selectedSlot.id,
              slotDatetime: selectedSlot.datetime,
            });

            const slotDocRef = doc(db, 'bookingSlots', selectedSlot.id);
            batch.update(slotDocRef, {
              isBooked: true,
              bookedBy: user.uid,
              transactionId: newTransactionRef.id,
            });

            await batch.commit();

            queryClient.invalidateQueries({ queryKey: ['transactions', user?.uid] });
            queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
            queryClient.invalidateQueries({ queryKey: ['allTransactions'] });

            toast.success('Payment Successful!', {
              description: `Booking confirmed for ${format(selectedSlot.datetime.toDate(), 'PPP p')}.`,
            });
            setOpen(false);
            form.reset();
            setStep(1);
          } catch (error) {
              console.error("Error processing booking:", error);
              toast.error('Payment successful, but failed to save transaction details.');
          }
        },
        prefill: {
          name: values.name,
          contact: values.phone,
        },
        notes: {
          address: `${values.address}, ${values.city}, ${values.postalCode}`,
          reminderId: reminder.id,
        },
        theme: {
          color: '#8b5cf6',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            // Reopen the booking dialog if payment is dismissed
            setTimeout(() => setOpen(true), 100);
          },
          confirm_close: true,
          escape: true,
          animation: false, // Disable animation to prevent focus issues
          backdrop_close: false,
          handleback: true,
        },
        config: {
          display: {
            blocks: {
              utib: {
                name: 'Pay using Axis Bank',
                instruments: [
                  {
                    method: 'card'
                  }, 
                  {
                    method: 'netbanking'
                  }
                ]
              }
            },
            sequence: ['block.utib'],
            preferences: {
              show_default_blocks: true,
            }
          }
        }
      };

      console.log('Opening Razorpay with options:', options);
      
      // Close the booking dialog temporarily to avoid z-index conflicts
      setOpen(false);
      
      // Add styles to fix input field issues
      const style = document.createElement('style');
      style.innerHTML = `
        .razorpay-container {
          z-index: 999999 !important;
          position: fixed !important;
        }
        .razorpay-checkout-frame {
          z-index: 999999 !important;
          position: fixed !important;
        }
        .razorpay-backdrop {
          z-index: 999998 !important;
          position: fixed !important;
        }
        input[data-razorpay] {
          pointer-events: auto !important;
          z-index: 1000000 !important;
          position: relative !important;
        }
        .razorpay-payment-form input {
          pointer-events: auto !important;
          user-select: auto !important;
          touch-action: manipulation !important;
        }
      `;
      document.head.appendChild(style);
      
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        toast.error('Payment Failed', {
          description: response.error.description,
        });
        // Reopen the booking dialog if payment fails
        setTimeout(() => setOpen(true), 100);
        // Remove the style
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      });
      
      // Ensure DOM is ready before opening Razorpay
      setTimeout(() => {
        try {
          rzp.open();
          
          // Clean up styles after payment modal closes
          setTimeout(() => {
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }
          }, 1000);
          
        } catch (error) {
          console.error('Error opening Razorpay:', error);
          toast.error('Failed to open payment gateway. Please try again.');
          setOpen(true);
          // Remove the style on error
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        }
      }, 100); // Reduced delay
      
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };
  
  const selectedSlot = availableSlots?.find(s => s.id === form.getValues('slotId'));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => {
                form.reset();
                setStep(1);
            }, 200);
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Book Home Vaccination</DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 1 && 'Step 1 of 4: Select an available date and time.'}
            {step === 2 && 'Step 2 of 4: Please enter your contact and address details.'}
            {step === 3 && (isLoadingProducts ? 'Loading vaccines...' : 'Step 3 of 4: Select the vaccines for your pet.')}
            {step === 4 && `Step 4 of 4: Confirm your booking details.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePayment)}>
            <div className="min-h-[300px] space-y-6 py-4">
                {step === 1 && (
                    <Step1SlotPicker 
                        control={form.control} 
                        availableSlots={availableSlots || []} 
                        isLoading={isLoadingSlots}
                    />
                )}
                {step === 2 && <Step2ContactForm control={form.control} />}
                {step === 3 && <Step3VaccineSelection control={form.control} vaccines={vaccineOptions} />}
                {step === 4 && selectedSlot && (
                    <Step4Confirmation 
                        formValues={form.getValues()}
                        reminder={reminder}
                        selectedSlot={selectedSlot}
                        selectedVaccines={selectedVaccines}
                    />
                )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {step === 1 && (
                 <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                      Cancel
                    </Button>
                 </DialogClose>
              )}
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack} 
                  className="w-full sm:w-auto bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {step < 4 && (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={isLoadingSlots || isLoadingProducts} 
                  className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === 4 && (
                 <Button 
                   type="submit" 
                   disabled={!isRazorpayLoaded || form.formState.isSubmitting || isLoadingSlots || isLoadingProducts || !selectedSlot || selectedVaccines.length === 0} 
                   className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600"
                 >
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {form.formState.isSubmitting ? 'Processing...' : `Pay ₹${totalAmount} & Book`}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFormDialog;