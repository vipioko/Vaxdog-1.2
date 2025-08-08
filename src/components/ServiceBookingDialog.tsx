import React, { useState, useEffect } from 'react';
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
import { GroomingService, PetHostelService, Dog as DogType } from '@/data/mock';
import useRazorpay from '@/hooks/useRazorpay';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import Step1PetSelection from './service-booking-steps/Step1PetSelection';
import Step2ServiceInputs from './service-booking-steps/Step2ServiceInputs';
import Step3ContactInfo from './service-booking-steps/Step3ContactInfo';
import Step4Confirmation from './service-booking-steps/Step4Confirmation';
import { useDogs } from '@/hooks/useDogs';
import { useGroomingBookings } from '@/hooks/useGroomingBookings';
import { usePetHostelBookings } from '@/hooks/usePetHostelBookings';
import { differenceInDays } from 'date-fns';

interface ServiceBookingDialogProps {
  serviceType: 'grooming' | 'petHostel';
  service: GroomingService | PetHostelService;
  children: React.ReactNode;
}

const RAZORPAY_KEY_ID = 'rzp_test_2n6MS8hK3tgdba'; // Replace with your actual Razorpay Key ID

const ServiceBookingDialog: React.FC<ServiceBookingDialogProps> = ({ serviceType, service, children }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const isRazorpayLoaded = useRazorpay();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { dogs } = useDogs();
  const { createGroomingBooking } = useGroomingBookings();
  const { createPetHostelBooking } = usePetHostelBookings();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const formSchema = z.object({
    petId: z.string().min(1, { message: 'Please select a pet.' }),
    fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).regex(/^(\+91)?[6-9]\d{9}$/, { message: 'Invalid Indian phone number.' }),
    address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
    city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
    postalCode: z.string().min(6, { message: 'Postal code must be 6 digits.' }).max(6),
    // Grooming specific
    preferredDate: z.date().optional(),
    preferredTime: z.string().optional(),
    // Pet Hostel specific
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
    foodPreference: z.enum(['veg', 'non-veg', 'both']).optional(),
  }).superRefine((data, ctx) => {
    if (serviceType === 'grooming') {
      if (!data.preferredDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Preferred date is required for grooming.',
          path: ['preferredDate'],
        });
      }
      if (!data.preferredTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Preferred time is required for grooming.',
          path: ['preferredTime'],
        });
      }
    } else if (serviceType === 'petHostel') {
      if (!data.dateRange?.from || !data.dateRange?.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Stay dates are required for pet hostel.',
          path: ['dateRange'],
        });
      }
      if (!data.foodPreference) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Food preference is required for pet hostel.',
          path: ['foodPreference'],
        });
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petId: '',
      fullName: user?.displayName || '',
      phone: user?.phoneNumber || '',
      address: '',
      city: '',
      postalCode: '',
      preferredDate: undefined,
      preferredTime: '',
      dateRange: { from: undefined, to: undefined },
      foodPreference: undefined,
    },
  });

  const selectedPetId = form.watch('petId');
  const selectedPet = dogs.find(dog => dog.id === selectedPetId);

  const calculateTotalAmount = () => {
    if (serviceType === 'grooming') {
      return (service as GroomingService).price;
    } else if (serviceType === 'petHostel') {
      const hostelService = service as PetHostelService;
      const startDate = form.getValues('dateRange.from');
      const endDate = form.getValues('dateRange.to');
      if (startDate && endDate) {
        const days = differenceInDays(endDate, startDate) + 1;
        return days * hostelService.dailyRate;
      }
      return 0;
    }
    return 0;
  };

  const totalAmount = calculateTotalAmount();

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger('petId');
    } else if (step === 2) {
      if (serviceType === 'grooming') {
        isValid = await form.trigger(['preferredDate', 'preferredTime']);
      } else if (serviceType === 'petHostel') {
        isValid = await form.trigger(['dateRange', 'foodPreference']);
      }
    } else if (step === 3) {
      isValid = await form.trigger(['fullName', 'phone', 'address', 'city', 'postalCode']);
    } else if (step === 4) {
      isValid = true; // Final step, validation already done
    }

    if (isValid) {
      setStep(s => s + 1);
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const handlePayment = async (values: z.infer<typeof formSchema>) => {
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is not ready. Please try again in a moment.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to make a payment.');
      return;
    }
    if (!selectedPet) {
      toast.error('Please select a pet.');
      return;
    }
    if (totalAmount <= 0) {
      toast.error('Total amount must be greater than zero.');
      return;
    }

    setIsProcessingPayment(true);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: (totalAmount * 100).toString(),
      currency: 'INR',
      name: `VaxDog - ${service.name}`,
      description: `Booking for ${service.name} for ${selectedPet.name}`,
      image: '/favicon.ico',
      handler: async function (response: any) {
        try {
          const commonBookingData = {
            userId: user.uid,
            petId: selectedPet.id,
            petName: selectedPet.name,
            serviceId: service.id,
            serviceName: service.name,
            amount: totalAmount,
            paymentMethod: 'razorpay',
            paymentStatus: 'paid',
            bookingStatus: 'pending', // Admin needs to confirm
            customerDetails: {
              name: values.fullName,
              phone: values.phone,
              address: values.address,
              city: values.city,
              postalCode: values.postalCode,
            },
            petDetails: {
              name: selectedPet.name,
              breed: selectedPet.breed,
              petType: selectedPet.petType,
              dateOfBirth: selectedPet.dateOfBirth,
              age: selectedPet.age,
              aggressionLevel: selectedPet.aggressionLevel,
              weight: selectedPet.weight,
              sex: selectedPet.sex,
              matingInterest: selectedPet.matingInterest,
              pregnancyCount: selectedPet.pregnancyCount,
              pupCount: selectedPet.pupCount,
              vaccinationScheduleImages: selectedPet.vaccinationScheduleImages,
              // Mating interest, pregnancy count, pup count are not typically part of booking petDetails
              // as they are not directly relevant to the service being booked.
            },
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id || null,
          };

          if (serviceType === 'grooming') {
            await createGroomingBooking({
              ...commonBookingData,
              preferredDate: values.preferredDate ? values.preferredDate.toISOString() : undefined,
              preferredTime: values.preferredTime,
            });
          } else if (serviceType === 'petHostel') {
            await createPetHostelBooking({
              ...commonBookingData,
              startDate: values.dateRange?.from ? values.dateRange.from.toISOString() : undefined,
              endDate: values.dateRange?.to ? values.dateRange.to.toISOString() : undefined,
              foodPreference: values.foodPreference,
            });
          }

          toast.success('Payment Successful!', {
            description: `Your booking for ${service.name} has been placed.`,
          });
          setOpen(false);
          form.reset();
          setStep(1);
        } catch (error: any) {
          console.error("Error saving booking:", error);
          toast.error('Booking could not be saved.', {
            description: 'Your payment was successful. Please contact support with your payment ID.',
          });
        } finally {
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: values.fullName,
        contact: values.phone,
      },
      notes: {
        serviceType: serviceType,
        serviceId: service.id,
        petId: selectedPet.id,
      },
      theme: {
        color: '#8b5cf6',
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          setIsProcessingPayment(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response);
      toast.error('Payment Failed', {
        description: response.error.description,
      });
      setIsProcessingPayment(false);
    });

    try {
      rzp.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      toast.error('Failed to open payment gateway. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        form.reset();
        setStep(1);
        setIsProcessingPayment(false);
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Book {service.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 1 && 'Step 1 of 4: Select your pet for this service.'}
            {step === 2 && `Step 2 of 4: Provide details for your ${serviceType} service.`}
            {step === 3 && 'Step 3 of 4: Please enter your contact and address details.'}
            {step === 4 && `Step 4 of 4: Confirm your booking details and proceed to payment.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePayment)}>
            <div className="min-h-[300px] space-y-6 py-4">
              {step === 1 && <Step1PetSelection control={form.control} />}
              {step === 2 && <Step2ServiceInputs control={form.control} serviceType={serviceType} />}
              {step === 3 && <Step3ContactInfo control={form.control} />}
              {step === 4 && selectedPet && (
                <Step4Confirmation
                  formValues={form.getValues()}
                  serviceType={serviceType}
                  service={service}
                  selectedPet={selectedPet}
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
                  className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  type="submit"
                  disabled={isProcessingPayment || !isRazorpayLoaded || totalAmount <= 0}
                  className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </div>
                  ) : (
                    `Pay ₹${totalAmount.toFixed(2)} & Book`
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingDialog;