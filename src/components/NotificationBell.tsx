import React, { useState } from 'react';
import { Bell, X, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, highPriorityCount, hasOverdue } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'due-soon':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'booking-confirmed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Bell className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (type === 'overdue') return 'border-l-red-500 bg-red-500/5';
    if (type === 'due-soon' && priority === 'high') return 'border-l-yellow-500 bg-yellow-500/5';
    if (type === 'due-soon') return 'border-l-yellow-400 bg-yellow-400/5';
    if (type === 'booking-confirmed') return 'border-l-green-500 bg-green-500/5';
    return 'border-l-blue-500 bg-blue-500/5';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.reminderId) {
      // Navigate to the specific dog's profile or dashboard
      if (notification.dogName) {
        navigate(`/my-dogs/${encodeURIComponent(notification.dogName)}`);
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
    setIsOpen(false);
  };

  const getBellColor = () => {
    if (hasOverdue) return 'text-red-400 animate-pulse';
    if (highPriorityCount > 0) return 'text-yellow-400';
    if (unreadCount > 0) return 'text-purple-400';
    return 'text-slate-400';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="relative text-white hover:bg-white/10"
        >
          <Bell className={cn("h-5 w-5 transition-colors", getBellColor())} />
          {unreadCount > 0 && (
            <div className={cn(
              "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
              hasOverdue ? "bg-red-500 animate-pulse" : 
              highPriorityCount > 0 ? "bg-yellow-500" : "bg-purple-500"
            )}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 bg-slate-800 border-slate-700" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {unreadCount} new
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No notifications</p>
                <p className="text-slate-500 text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 cursor-pointer hover:bg-slate-700/50 transition-colors",
                        getNotificationColor(notification.type, notification.priority)
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-slate-300 text-xs mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-slate-500 text-xs mt-2">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                        {notification.priority === 'high' && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-700">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-purple-300 hover:text-white hover:bg-purple-500/20"
                  onClick={() => {
                    navigate('/dashboard');
                    setIsOpen(false);
                  }}
                >
                  View All Reminders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;