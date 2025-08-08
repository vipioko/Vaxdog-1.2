import { useState, useEffect } from 'react';
import { Dog } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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

// Popular breed lists for autocomplete
const popularDogBreeds = [
  "Labrador Retriever", "German Shepherd", "Golden Retriever", "French Bulldog", "Bulldog",
  "Poodle", "Beagle", "Rottweiler", "German Shorthaired Pointer", "Dachshund",
  "Pembroke Welsh Corgi", "Australian Shepherd", "Yorkshire Terrier", "Boxer", "Siberian Husky",
  "Border Collie", "Boston Terrier", "Bernese Mountain Dog", "Pomeranian", "Havanese",
  "English Springer Spaniel", "Brittany", "Cocker Spaniel", "Border Terrier", "Mastiff"
];

const popularCatBreeds = [
  "Ragdoll", "Maine Coon", "Exotic Shorthair", "Persian", "Devon Rex",
  "Sphynx", "Abyssinian", "Scottish Fold", "British Shorthair", "American Shorthair",
  "Siamese", "Bengal", "Russian Blue", "Burmese", "Siberian",
  "Norwegian Forest Cat", "Oriental Shorthair", "Selkirk Rex", "Manx", "Egyptian Mau"
];

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
  const [openBreedCombobox, setOpenBreedCombobox] = useState(false);
  const [breedSearch, setBreedSearch] = useState('');

  useEffect(() => {
    setEditedDog(dog);
    setNewImageFile(null);
    setBreedSearch('');
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
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto rounded-lg bg-slate-800 border-slate-700">
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

          {/* Breed Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="breed" className="text-sm font-medium text-white">
              Breed
            </Label>
            <Popover open={openBreedCombobox} onOpenChange={setOpenBreedCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openBreedCombobox}
                  className="w-full h-12 justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  {editedDog.breed || "Select or type breed..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-700">
                <Command>
                  <CommandInput
                    placeholder="Search breed..."
                    className="text-white"
                    value={breedSearch}
                    onValueChange={(value) => {
                      setBreedSearch(value);
                      setEditedDog({ ...editedDog, breed: value });
                    }}
                  />
                  <CommandList>
                    <CommandEmpty className="text-slate-400 p-4">
                      {breedSearch ? `Use "${breedSearch}" as custom breed` : 'No breed found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {(editedDog.petType === 'dog' ? popularDogBreeds : popularCatBreeds)
                        .filter(breed => breed.toLowerCase().includes(breedSearch.toLowerCase()))
                        .map((breed) => (
                          <CommandItem
                            key={breed}
                            value={breed}
                            onSelect={(currentValue) => {
                              setEditedDog({ ...editedDog, breed: currentValue });
                              setOpenBreedCombobox(false);
                              setBreedSearch('');
                            }}
                            className="text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                editedDog.breed === breed ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {breed}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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

          {/* Weight and Sex */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium text-white">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={editedDog.weight || ''}
                onChange={(e) => setEditedDog({ ...editedDog, weight: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                placeholder="e.g., 15"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex" className="text-sm font-medium text-white">
                Sex
              </Label>
              <Select
                value={editedDog.sex || ''}
                onValueChange={(value) => setEditedDog({ ...editedDog, sex: value as 'Male' | 'Female', pregnancyCount: undefined, pupCount: undefined })}
              >
                <SelectTrigger className="w-full h-12 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Male" className="text-white hover:bg-slate-600">♂ Male</SelectItem>
                  <SelectItem value="Female" className="text-white hover:bg-slate-600">♀ Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aggression Level */}
          <div className="space-y-2">
            <Label htmlFor="aggressionLevel" className="text-sm font-medium text-white">
              Aggression Level
            </Label>
            <Select
              value={editedDog.aggressionLevel || ''}
              onValueChange={(value) => setEditedDog({ ...editedDog, aggressionLevel: value as 'Low' | 'Medium' | 'High' })}
            >
              <SelectTrigger className="w-full h-12 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select aggression level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Low" className="text-white hover:bg-slate-600">😊 Low (Friendly)</SelectItem>
                <SelectItem value="Medium" className="text-white hover:bg-slate-600">😐 Medium (Cautious)</SelectItem>
                <SelectItem value="High" className="text-white hover:bg-slate-600">😠 High (Aggressive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mating Service Interest */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="space-y-1">
              <Label htmlFor="matingInterest" className="text-sm font-medium text-white">
                Interested in Mating Service
              </Label>
              <p className="text-xs text-slate-400">
                Would you like to receive mating service recommendations?
              </p>
            </div>
            <Switch
              id="matingInterest"
              checked={editedDog.matingInterest || false}
              onCheckedChange={(checked) => setEditedDog({ ...editedDog, matingInterest: checked })}
            />
          </div>

          {/* Conditional Pregnancy Fields for Female Pets */}
          {editedDog.sex === 'Female' && (
            <div className="space-y-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-pink-300 flex items-center gap-2">
                🤱 Pregnancy History
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pregnancyCount" className="text-sm font-medium text-white">
                    Times Pregnant
                  </Label>
                  <Input
                    id="pregnancyCount"
                    type="number"
                    value={editedDog.pregnancyCount || ''}
                    onChange={(e) => setEditedDog({ ...editedDog, pregnancyCount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="e.g., 1"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pupCount" className="text-sm font-medium text-white">
                    Total Offspring
                  </Label>
                  <Input
                    id="pupCount"
                    type="number"
                    value={editedDog.pupCount || ''}
                    onChange={(e) => setEditedDog({ ...editedDog, pupCount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

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