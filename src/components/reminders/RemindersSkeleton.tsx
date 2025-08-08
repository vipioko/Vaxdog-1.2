
import { Skeleton } from '@/components/ui/skeleton';

const RemindersSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
};

export default RemindersSkeleton;
