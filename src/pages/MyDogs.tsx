import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DogCard from '@/components/DogCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dog, Reminder } from '@/data/mock';
import EditDogDialog from '@/components/EditDogDialog';
import { differenceInDays, startOfToday, differenceInYears, differenceInMonths } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, storage } from '@/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, writeBatch, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Skeleton } from '@/components/ui/skeleton';
import { useDogs } from '@/hooks/useDogs';
import { useReminders } from '@/hooks/useReminders';
import { useTransactions } from '@/hooks/useTransactions';

interface MyDogsProps {
  reminderDueSoonDays: number;
}

const MyDogs = ({ reminderDueSoonDays }: MyDogsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newPet, setNewPet] = useState({ 
    name: '', 
    breed: '', 
    petType: '', 
    dateOfBirth: '', 
    age: 0, 
    imageUrl: '' 
  });
  const [newPetFile, setNewPetFile] = useState<File | null>(null);
  const [dogToEdit, setDogToEdit] = useState<Dog | null>(null);

  const { dogs, isLoadingDogs } = useDogs();
  const { reminders } = useReminders();
  const { transactions } = useTransactions();

  const calculateDetailedAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return { years: 0, months: 0, displayText: '0 years old' };
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const years = differenceInYears(today, dob);
    const months = differenceInMonths(today, dob) % 12;
    
    let displayText = '';
    if (years > 0 && months > 0) {
      displayText = `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'} old`;
    } else if (years > 0) {
      displayText = `${years} ${years === 1 ? 'year' : 'years'} old`;
    } else if (months > 0) {
      displayText = `${months} ${months === 1 ? 'month' : 'months'} old`;
    } else {
      displayText = 'Less than a month old';
    }
    
    return { years, months, displayText };
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const { years, months } = calculateDetailedAge(dateOfBirth);
    
    if (years > 0) {
      return years + (months / 12);
    } else {
      return Math.max(0.1, months / 12); // Minimum 0.1 for pets under 1 month
    }
  };

  const handleDateOfBirthChange = (date: string) => {
    const detailedAge = calculateDetailedAge(date);
    setNewPet(prev => ({
      ...prev,
      dateOfBirth: date,
      age: calculateAge(date)
    }));
  };

  const addDogMutation = useMutation({
    mutationFn: async ({ dogData, file }: { dogData: Omit<Dog, 'id' | 'imageUrl'>, file: File | null }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const dogDocRef = doc(collection(db, 'users', user.uid, 'dogs'));
      let imageUrl = '';

      if (file) {
        const storageRef = ref(storage, `users/${user.uid}/dogs/${dogDocRef.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      const finalDogData: Omit<Dog, 'id'> = { ...dogData, imageUrl };
      await setDoc(dogDocRef, finalDogData);
      return { ...finalDogData, id: dogDocRef.id };
    },
    onSuccess: (data: Dog) => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
      toast.success(`Welcome ${data.name}! 🐾`);
      setNewPet({ name: '', breed: '', petType: '', dateOfBirth: '', age: 0, imageUrl: '' });
      setNewPetFile(null);
      setAddDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("addDogMutation error", error);
      if (error.code === 'storage/unauthorized') {
        toast.error("Image upload failed: Permission issue. Please check Firebase Storage rules.");
      } else {
        toast.error(error.message || "Failed to add pet.");
      }
    },
  });

  const updateDogMutation = useMutation({
    mutationFn: async ({ dogId, dogData, file }: { dogId: string; dogData: Partial<Dog>; file: File | null }) => {
      if (!user) throw new Error("User not authenticated");
      const dogDocRef = doc(db, 'users', user.uid, 'dogs', dogId);

      const dataToUpdate = { ...dogData };

      if (file) {
        const storageRef = ref(storage, `users/${user.uid}/dogs/${dogId}/${file.name}`);
        await uploadBytes(storageRef, file);
        dataToUpdate.imageUrl = await getDownloadURL(storageRef);
      }
      
      return updateDoc(dogDocRef, dataToUpdate);
    },
    onSuccess: (_, { dogData }) => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
      toast.success(`${dogData.name || dogToEdit?.name}'s profile has been updated.`);
      setDogToEdit(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update pet.");
    },
  });

  const deleteDogMutation = useMutation({
    mutationFn: (dogId: string) => {
      if (!user) throw new Error("User not authenticated");
      const dogDocRef = doc(db, 'users', user.uid, 'dogs', dogId);
      return deleteDoc(dogDocRef);
    },
    onSuccess: (_, dogId) => {
      queryClient.invalidateQueries({ queryKey: ['dogs', user?.uid] });
      const deletedDog = dogs.find(d => d.id === dogId);
      toast.success(`${deletedDog?.name || 'The pet'} has been removed.`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete pet.");
    },
  });

  const updateDogNameInRemindersMutation = useMutation({
    mutationFn: async ({ oldDogName, newDogName }: { oldDogName:string, newDogName:string }) => {
      if (!user) throw new Error("User not authenticated");
      const remindersRef = collection(db, 'users', user.uid, 'reminders');
      const q = query(remindersRef, where('dog', '==', oldDogName));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        batch.update(doc.ref, { dog: newDogName });
      });
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.uid] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update reminders.");
    }
  });

  const deleteRemindersForDogMutation = useMutation({
    mutationFn: async (dogName: string) => {
      if (!user) throw new Error("User not authenticated");
      const remindersRef = collection(db, 'users', user.uid, 'reminders');
      const q = query(remindersRef, where('dog', '==', dogName));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.uid] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete associated reminders.");
    }
  });

  const handleAddPet = () => {
    if (newPet.name && newPet.breed && newPet.petType && newPet.dateOfBirth) {
      if (dogs.some(dog => dog.name.toLowerCase() === newPet.name.toLowerCase())) {
        toast.error("A pet with this name already exists.");
        return;
      }
      addDogMutation.mutate({ 
        dogData: { 
          name: newPet.name, 
          breed: newPet.breed, 
          age: newPet.age,
          petType: newPet.petType,
          dateOfBirth: newPet.dateOfBirth
        },
        file: newPetFile
      });
    } else {
      toast.error("Please fill out all fields.");
    }
  };

  const handleUpdateDog = (updatedDog: Dog, newImageFile: File | null) => {
    if (!dogToEdit) return;

    const isNameTakenByAnotherDog = dogs.some(
      dog => dog.id !== dogToEdit.id && dog.name.toLowerCase() === updatedDog.name.toLowerCase()
    );

    if (isNameTakenByAnotherDog) {
      toast.error("A pet with this name already exists.");
      return;
    }

    updateDogMutation.mutate({ dogId: dogToEdit.id, dogData: updatedDog, file: newImageFile });
    
    if (dogToEdit && dogToEdit.name !== updatedDog.name) {
      updateDogNameInRemindersMutation.mutate({ oldDogName: dogToEdit.name, newDogName: updatedDog.name });
    }
  };

  const handleDeleteDog = (dogToDelete: Dog) => {
    deleteRemindersForDogMutation.mutate(dogToDelete.name);
    deleteDogMutation.mutate(dogToDelete.id);
  };

  const getDogReminderStatus = (dog: Dog): { 
    status: 'overdue' | 'due-soon' | null; 
    hasBookedReminders: boolean;
    dueDateInfo?: { daysUntilDue: number; vaccineName: string };
  } => {
    const today = startOfToday();
    let status: 'overdue' | 'due-soon' | null = null;
    let hasBookedReminders = false;
    let dueDateInfo: { daysUntilDue: number; vaccineName: string } | undefined;

    for (const reminder of reminders) {
      if (reminder.dog !== dog.name || reminder.status !== 'upcoming') {
        continue;
      }
      
      const isBooked = transactions?.some(tx => tx.reminderId === reminder.id && tx.status === 'successful');
      if (isBooked) {
        hasBookedReminders = true;
        continue;
      }
      
      const dueDate = new Date(reminder.due);
      const daysUntilDue = differenceInDays(dueDate, today);

      if (daysUntilDue < 0) {
        return { 
          status: 'overdue', 
          hasBookedReminders,
          dueDateInfo: { daysUntilDue, vaccineName: reminder.vaccine }
        };
      }

      if (daysUntilDue >= 0 && daysUntilDue <= reminderDueSoonDays) {
        status = 'due-soon';
        dueDateInfo = { daysUntilDue, vaccineName: reminder.vaccine };
      }
    }
    return { status, hasBookedReminders, dueDateInfo };
  };

  const sortedDogs = [...dogs].sort((a, b) => {
    const aStatusInfo = getDogReminderStatus(a);
    const bStatusInfo = getDogReminderStatus(b);

    const statusToPriority = (status: 'overdue' | 'due-soon' | null, hasBooked: boolean) => {
      if (hasBooked && !status) return 3;
      if (status === 'overdue') return 0;
      if (status === 'due-soon') return 1;
      return 2;
    };

    const priorityA = statusToPriority(aStatusInfo.status, aStatusInfo.hasBookedReminders);
    const priorityB = statusToPriority(bStatusInfo.status, bStatusInfo.hasBookedReminders);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.name.localeCompare(b.name);
  });

  if (isLoadingDogs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
        <div className="px-4 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">My Pets</h1>
            <Skeleton className="h-10 w-20 bg-slate-700" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 rounded-lg bg-slate-700" />
            <Skeleton className="h-40 rounded-lg bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      <div className="px-4 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Pets</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen && addDogMutation.isPending) return;
            setAddDialogOpen(isOpen);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> 
                Add Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto rounded-lg bg-slate-800 border-slate-700">
              <DialogHeader className="space-y-3 pb-4">
                <DialogTitle className="text-xl font-bold text-center text-white">Add a new pet</DialogTitle>
                <DialogDescription className="text-sm text-center text-slate-400">
                  Enter your pet's details here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-2">
                {/* Pet Type */}
                <div className="space-y-2">
                  <Label htmlFor="petType" className="text-sm font-medium text-white">
                    Pet Type *
                  </Label>
                  <Select onValueChange={(value) => setNewPet({ ...newPet, petType: value })}>
                    <SelectTrigger className="w-full h-12 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="dog" className="text-white hover:bg-slate-600">🐕 Dog</SelectItem>
                      <SelectItem value="cat" className="text-white hover:bg-slate-600">🐱 Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-white">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    className="w-full h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="e.g., Buddy"
                  />
                </div>

                {/* Breed */}
                <div className="space-y-2">
                  <Label htmlFor="breed" className="text-sm font-medium text-white">
                    Breed *
                  </Label>
                  <Input
                    id="breed"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    className="w-full h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="e.g., Golden Retriever"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-medium text-white">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newPet.dateOfBirth}
                    onChange={(e) => handleDateOfBirthChange(e.target.value)}
                    className="w-full h-12 bg-slate-700 border-slate-600 text-white"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {newPet.dateOfBirth && (
                    <p className="text-xs text-slate-400 mt-1">
                      Age: {calculateDetailedAge(newPet.dateOfBirth).displayText}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium text-white">
                    Photo (Optional)
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setNewPetFile(file);
                        setNewPet({ ...newPet, imageUrl: URL.createObjectURL(file) });
                      } else {
                        setNewPetFile(null);
                        setNewPet({ ...newPet, imageUrl: '' });
                      }
                    }}
                    className="w-full h-12 bg-slate-700 border-slate-600 text-white"
                  />
                  {newPet.imageUrl && (
                    <div className="mt-3 flex justify-center">
                      <img 
                        src={newPet.imageUrl} 
                        alt="Pet preview" 
                        className="h-24 w-24 rounded-lg object-cover border-2 border-slate-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button 
                  onClick={handleAddPet} 
                  disabled={addDogMutation.isPending} 
                  className="w-full h-12 text-base font-medium bg-purple-500 hover:bg-purple-600"
                >
                  {addDogMutation.isPending ? 'Saving...' : 'Save pet'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {dogs.length === 0 && !isLoadingDogs ? (
            <div className="md:col-span-2 text-center py-12">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-slate-400 text-lg mb-2">No pets yet</p>
              <p className="text-slate-500 text-sm">Add your first furry friend to get started!</p>
            </div>
          ) : (
            sortedDogs.map((dog) => {
              const { status: reminderStatus, hasBookedReminders, dueDateInfo } = getDogReminderStatus(dog);
              const detailedAge = calculateDetailedAge(dog.dateOfBirth || '');
              return (
                <DogCard
                  key={dog.id}
                  {...dog}
                  detailedAge={detailedAge.displayText}
                  reminderStatus={reminderStatus}
                  hasBookedReminders={hasBookedReminders}
                  dueDateInfo={dueDateInfo}
                  onClick={() => navigate(`/my-dogs/${encodeURIComponent(dog.name)}`)}
                  onEdit={() => setDogToEdit(dog)}
                  onDelete={() => handleDeleteDog(dog)} />
              );
            })
          )}
        </div>
        
        {dogToEdit && (
          <EditDogDialog
            dog={dogToEdit}
            isOpen={!!dogToEdit}
            onSave={handleUpdateDog}
            onClose={() => {
              if (!updateDogMutation.isPending) {
                setDogToEdit(null);
              }
            }}
            onImageSelect={(file) => { /* needed for type */ }}
            isSaving={updateDogMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default MyDogs;