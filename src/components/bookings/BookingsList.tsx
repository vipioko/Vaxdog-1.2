// src/components/bookings/BookingsList.tsx
import React from 'react';
import { Transaction } from '@/hooks/useTransactions'; // FIX: Import unified Transaction interface
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Home, IndianRupee, Calendar, CheckCircle, XCircle, Clock, Stethoscope } from 'lucide-react'; // FIX: Add Stethoscope icon

interface BookingsListProps {
    transactions?: Transaction[];
}

const BookingsList: React.FC<BookingsListProps> = ({ transactions }) => {
    // FIX: This component now specifically handles 'vaccination' type transactions
    const vaccinationBookings = transactions?.filter(tx => tx.type === 'vaccination') || [];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'successful':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'failed':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'pending':
                return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'successful':
                return <CheckCircle className="h-4 w-4" />;
            case 'failed':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'successful':
                return 'Confirmed';
            case 'failed':
                return 'Failed';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    if (vaccinationBookings.length === 0) {
        return (
             <div className="text-center text-slate-400 py-8">
                <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-base mb-1">No home vaccination bookings found.</p>
                <p className="text-sm">You can book one from an upcoming reminder.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {vaccinationBookings.map((tx) => (
                <div key={tx.id} className="p-4 bg-slate-800/30 rounded-lg border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Stethoscope className="h-4 w-4 text-blue-400 flex-shrink-0" /> {/* FIX: Use Stethoscope for vaccination */}
                                <p className="font-semibold text-white text-sm truncate">{tx.service}</p>
                            </div>
                            
                            <div className="space-y-1 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Booked: {tx.createdAt ? format(tx.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}</span>
                                </div>
                                
                                {tx.slotDatetime && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        <span>Scheduled: {format(tx.slotDatetime.toDate(), 'MMM d, yyyy, p')}</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">ID: {tx.paymentId ? tx.paymentId.slice(-8) : tx.id.slice(-8)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Badge className={getStatusColor(tx.status)}>
                                {getStatusIcon(tx.status)}
                                <span className="ml-1">{getStatusText(tx.status)}</span>
                            </Badge>
                            
                            <div className="flex items-center text-white font-semibold">
                                <IndianRupee className="h-4 w-4 mr-1" />
                                <span>{new Intl.NumberFormat('en-IN').format(tx.amount)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Vaccines breakdown if available */}
                    {tx.vaccines && tx.vaccines.length > 0 && (
                        <div className="mt-3 p-2 bg-slate-700/30 rounded text-xs">
                            <p className="text-slate-400 mb-1">Vaccines:</p>
                            <div className="space-y-1">
                                {tx.vaccines.map((vaccine, index) => (
                                    <div key={index} className="flex justify-between text-slate-300">
                                        <span>{vaccine.name}</span>
                                        <span>₹{vaccine.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default BookingsList;

