import { useState, useEffect } from 'react';
import { Dog } from '@/data/mock';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInYears, differenceInMonths } from 'date-fns';

interface EditDogDialogProps {
  dog: Dog;
  isOpen: boolean;
  onSave: (updatedDog: Dog, newImageFile: File | null) => void;
  onClose: () => void;
  onImageSelect: (file: File | null) => void;
  isSaving: boolean;
}

const EditDogDialog = ({ dog, isOpen, onSave, onClose, onImageSelect, isSaving }: EditDogDialogProps) => {
  const [editedDog, setEditedDog] = useState(dog);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    setEditedDog(dog);
    setNewImageFile(null);
  }, [dog]);

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
      return Math.max(0.1, months / 12);
    }
  };

  const handleDateOfBirthChange = (date: string) => {
    setEditedDog(prev => ({
      ...prev,
      dateOfBirth: date,
      age: calculateAge(date)
    }));
  };

  const handleSave = () => {
    onSave({ ...editedDog, age: Number(editedDog.age) }, newImageFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto rounded-lg bg-slate-800 border-slate-700">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl font-bold text-center text-white">Edit {dog.name}'s Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-white">
              Name
            </Label>
            <Input
              id="name"
              value={editedDog.name}
              onChange={(e) => setEditedDog({ ...editedDog, name: e.target.value })}
              className="w-full h-12 bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="breed" className="text-sm font-medium text-white">
              Breed
            </Label>
            <Input
              id="breed"
              value={editedDog.breed}
              onChange={(e) => setEditedDog({ ...editedDog, breed: e.target.value })}
              className="w-full h-12 bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-medium text-white">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={editedDog.dateOfBirth || ''}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
              className="w-full h-12 bg-slate-700 border-slate-600 text-white"
              max={new Date().toISOString().split('T')[0]}
            />
            {editedDog.dateOfBirth && (
              <p className="text-xs text-slate-400 mt-1">
                Age: {calculateDetailedAge(editedDog.dateOfBirth).displayText}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium text-white">
              Photo
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setNewImageFile(file);
                  onImageSelect(file);
                  setEditedDog({ ...editedDog, imageUrl: URL.createObjectURL(file) });
                } else {
                  onImageSelect(null);
                }
              }}
              className="w-full h-12 bg-slate-700 border-slate-600 text-white"
            />
            {editedDog.imageUrl && (
              <div className="mt-3 flex justify-center">
                <img 
                  src={editedDog.imageUrl} 
                  alt="Pet preview" 
                  className="h-24 w-24 rounded-lg object-cover border-2 border-slate-600"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-6 gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1 h-12 bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 bg-purple-500 hover:bg-purple-600">
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDogDialog;