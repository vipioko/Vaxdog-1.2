import { useMemo } from 'react';
import { useReminders } from './useReminders';
import { useTransactions } from './useTransactions';
import { differenceInDays, startOfToday } from 'date-fns';

export interface Notification {
  id: string;
  type: 'overdue' | 'due-soon' | 'booking-confirmed' | 'reminder-added';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  reminderId?: string;
  dogName?: string;
  vaccine?: string;
  isRead?: boolean;
}

export const useNotifications = () => {
  const { reminders } = useReminders();
  const { transactions } = useTransactions();

  const notifications = useMemo(() => {
    const today = startOfToday();
    const notificationList: Notification[] = [];

    // Process reminders for overdue and due soon notifications
    reminders.forEach(reminder => {
      if (reminder.status !== 'upcoming') return;

      // Check if this reminder has a successful booking
      const hasBooking = transactions?.some(tx => 
        tx.reminderId === reminder.id && tx.status === 'successful'
      );

      // Skip if already booked
      if (hasBooking) return;

      const dueDate = new Date(reminder.due);
      const daysUntilDue = differenceInDays(dueDate, today);

      if (daysUntilDue < 0) {
        // Overdue notification
        const daysOverdue = Math.abs(daysUntilDue);
        notificationList.push({
          id: `overdue-${reminder.id}`,
          type: 'overdue',
          title: 'Vaccination Overdue!',
          message: `${reminder.vaccine} for ${reminder.dog} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
          priority: 'high',
          timestamp: dueDate,
          reminderId: reminder.id,
          dogName: reminder.dog,
          vaccine: reminder.vaccine,
          isRead: false
        });
      } else if (daysUntilDue <= 7) {
        // Due soon notification (within 7 days)
        notificationList.push({
          id: `due-soon-${reminder.id}`,
          type: 'due-soon',
          title: 'Vaccination Due Soon',
          message: `${reminder.vaccine} for ${reminder.dog} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          priority: daysUntilDue <= 3 ? 'high' : 'medium',
          timestamp: dueDate,
          reminderId: reminder.id,
          dogName: reminder.dog,
          vaccine: reminder.vaccine,
          isRead: false
        });
      }
    });

    // Add booking confirmation notifications for recent transactions
    transactions?.slice(0, 3).forEach(transaction => {
      if (transaction.status === 'successful' && transaction.createdAt) {
        const transactionDate = transaction.createdAt.toDate();
        const daysSinceBooking = differenceInDays(today, transactionDate);
        
        // Show booking confirmations for last 7 days
        if (daysSinceBooking <= 7) {
          notificationList.push({
            id: `booking-${transaction.id}`,
            type: 'booking-confirmed',
            title: 'Booking Confirmed',
            message: `Home vaccination booked successfully - ₹${transaction.amount}`,
            priority: 'medium',
            timestamp: transactionDate,
            isRead: false
          });
        }
      }
    });

    // Sort by priority and timestamp
    return notificationList.sort((a, b) => {
      // First sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by timestamp (most recent first for same priority)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [reminders, transactions]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  return {
    notifications,
    unreadCount,
    highPriorityCount,
    hasOverdue: notifications.some(n => n.type === 'overdue'),
    hasDueSoon: notifications.some(n => n.type === 'due-soon')
  };
};