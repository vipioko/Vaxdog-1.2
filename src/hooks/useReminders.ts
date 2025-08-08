
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from "sonner";
import { format } from 'date-fns';
import { Reminder } from '@/data/mock';

// Function to play ting sound
const playTingSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
};

export const useReminders = (dogName?: string) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: reminders = [], isLoading: isLoadingReminders } = useQuery<Reminder[]>({
        queryKey: ['reminders', user?.uid, dogName],
        queryFn: async () => {
            if (!user) return [];
            const remindersCollectionRef = collection(db, 'users', user.uid, 'reminders');
            
            const remindersQuery = dogName 
                ? query(remindersCollectionRef, where('dog', '==', dogName))
                : remindersCollectionRef;

            const remindersSnapshot = await getDocs(remindersQuery);
            const sortedReminders = remindersSnapshot.docs
                .map(doc => ({ ...(doc.data() as Omit<Reminder, 'id'>), id: doc.id }))
                .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
            return sortedReminders;
        },
        enabled: !!user,
    });

    const addReminderMutation = useMutation({
        mutationFn: (newReminderData: Omit<Reminder, 'id' | 'status' | 'completedDate'>) => {
            if (!user) throw new Error("User not authenticated");
            const reminderToAdd: Omit<Reminder, 'id'> = {
                ...newReminderData,
                status: 'upcoming',
            };
            return addDoc(collection(db, 'users', user.uid, 'reminders'), reminderToAdd);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reminders', user?.uid] });
            toast.success(`Reminder for ${variables.vaccine} has been set!`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add reminder.");
        }
    });

    const updateReminderMutation = useMutation({
        mutationFn: ({ reminderId, dataToUpdate }: { reminderId: string; dataToUpdate: Partial<Reminder> }) => {
            if (!user) throw new Error("User not authenticated");
            const reminderDocRef = doc(db, 'users', user.uid, 'reminders', reminderId);
            return updateDoc(reminderDocRef, dataToUpdate);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders', user?.uid] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update reminder.");
        }
    });

    const deleteReminderMutation = useMutation({
        mutationFn: (reminderId: string) => {
            if (!user) throw new Error("User not authenticated");
            const reminderDocRef = doc(db, 'users', user.uid, 'reminders', reminderId);
            return deleteDoc(reminderDocRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders', user?.uid] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete reminder.");
        }
    });

    const addReminder = ({ dog, vaccine, due }: { dog: string; vaccine: string; due: Date }) => {
        addReminderMutation.mutate({
            dog,
            vaccine,
            due: format(due, 'MMMM d, yyyy'),
        });
    };

    const markReminderAsComplete = (reminderId: string) => {
        updateReminderMutation.mutate({
            reminderId,
            dataToUpdate: {
                status: 'completed',
                completedDate: format(new Date(), 'MMMM d, yyyy')
            }
        }, {
            onSuccess: () => {
                const completedReminder = reminders.find(r => r.id === reminderId);
                if (completedReminder) {
                    playTingSound(); // Play ting sound
                    toast.success(`Marked ${completedReminder.vaccine} for ${completedReminder.dog} as complete!`);
                }
            }
        });
    };

    const deleteReminder = (reminderId: string) => {
        const reminderToDelete = reminders.find(r => r.id === reminderId);
        deleteReminderMutation.mutate(reminderId, {
            onSuccess: () => {
                if (reminderToDelete) {
                    toast.error(`Deleted reminder for ${reminderToDelete.vaccine}.`);
                }
            }
        });
    };

    const editReminder = (reminderId: string, updatedData: { vaccine: string; due: Date }) => {
        updateReminderMutation.mutate({
            reminderId,
            dataToUpdate: {
                vaccine: updatedData.vaccine,
                due: format(updatedData.due, 'MMMM d, yyyy')
            }
        }, {
            onSuccess: () => {
                toast.success(`Updated reminder for ${updatedData.vaccine}.`);
            }
        });
    };
    
    return {
        reminders,
        isLoadingReminders,
        addReminder,
        markReminderAsComplete,
        deleteReminder,
        editReminder,
    };
};
