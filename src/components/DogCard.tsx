import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MoreVertical, Cake } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

interface DogCardProps {
  name: string;
  breed: string;
  age: number;
  detailedAge?: string;
  imageUrl?: string;
  reminderStatus?: 'overdue' | 'due-soon' | null;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hasBookedReminders?: boolean;
  dueDateInfo?: {
    daysUntilDue: number;
    vaccineName: string;
  };
}

const DogCard: React.FC<DogCardProps> = ({ 
  name, 
  breed, 
  age, 
  detailedAge,
  imageUrl, 
  onClick, 
  onEdit, 
  onDelete, 
  reminderStatus, 
  hasBookedReminders,
  dueDateInfo
}) => {
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusColor = () => {
    if (hasBookedReminders) return 'border-green-500/50 bg-green-500/10';
    if (reminderStatus === 'overdue') return 'border-red-500/50 bg-red-500/10';
    if (reminderStatus === 'due-soon') return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-slate-700';
  };

  const getReminderText = () => {
    if (hasBookedReminders || !reminderStatus || !dueDateInfo) return null;
    
    if (reminderStatus === 'overdue') {
      const daysOverdue = Math.abs(dueDateInfo.daysUntilDue);
      return (
        <div className="mt-3 px-3 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-xs text-red-300 font-medium">
            {dueDateInfo.vaccineName} - Overdue by {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
          </p>
        </div>
      );
    }
    
    if (reminderStatus === 'due-soon') {
      return (
        <div className="mt-3 px-3 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
          <p className="text-xs text-yellow-300 font-medium">
            {dueDateInfo.vaccineName} - Due in {dueDateInfo.daysUntilDue} {dueDateInfo.daysUntilDue === 1 ? 'day' : 'days'}
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card 
      onClick={onClick} 
      className={cn(
        "w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer group bg-slate-800/50 border-2",
        getStatusColor()
      )}
    >
      <div className="overflow-hidden">
        {imageUrl ? (
          <picture>
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          </picture>
        ) : (
          <div className="w-full h-32 sm:h-40 md:h-48 bg-slate-700/50 flex items-center justify-center">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl bg-purple-500/20 text-purple-300 font-semibold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-4 md:p-6">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg sm:text-xl font-bold truncate text-white">{name}</CardTitle>
          <p className="text-xs sm:text-sm text-slate-400 truncate">{breed}</p>
          <div className="flex items-center text-xs sm:text-sm text-slate-300 mt-1 sm:mt-2">
            <Cake className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-pink-400 flex-shrink-0" />
            <span className="font-medium truncate">{detailedAge || `${age} ${age === 1 ? 'year' : 'years'} old`}</span>
          </div>
          {getReminderText()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-white hover:bg-slate-700" onClick={handleDropdownClick}>
              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-white hover:bg-slate-700">Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  );
};

export default DogCard;