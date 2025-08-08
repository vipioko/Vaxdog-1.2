import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Receipt } from 'lucide-react';

const TransactionCardSkeleton = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 bg-slate-800/50 border-slate-700">
                <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-32 bg-slate-700" />
                        <Skeleton className="h-4 w-24 bg-slate-700" />
                    </div>
                    <Skeleton className="h-5 w-20 bg-slate-700" />
                </div>
                <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-8 w-28 bg-slate-700" />
                    <Skeleton className="h-9 w-24 bg-slate-700" />
                </div>
            </Card>
        ))}
    </div>
);

const TransactionRowSkeleton = () => (
    <>
        {[...Array(3)].map((_, i) => (
            <TableRow key={i} className="border-slate-700">
                <TableCell><Skeleton className="h-5 w-24 bg-slate-700" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48 bg-slate-700" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 bg-slate-700" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 bg-slate-700" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto bg-slate-700" /></TableCell>
            </TableRow>
        ))}
    </>
);

const TransactionHistory = () => {
    const { transactions, isLoading, error } = useTransactions();

    if (error) {
        return (
            <div className="text-center py-10">
                <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 font-medium mb-2">Error loading transactions</p>
                <p className="text-slate-400 text-sm">Please try again later</p>
            </div>
        );
    }
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <>
                    <div className="sm:hidden"><TransactionCardSkeleton /></div>
                    <div className="hidden sm:block">
                        <div className="rounded-md border border-slate-700 bg-slate-800/30">
                            <Table>
                                <TableBody>
                                    <TransactionRowSkeleton />
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            );
        }

        if (!transactions || transactions.length === 0) {
            return (
                <div className="text-center py-12">
                    <Receipt className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                    <p className="text-slate-400 text-sm">Your payment history will appear here</p>
                </div>
            );
        }

        return (
            <ScrollArea className="h-[400px] w-full">
                {/* Mobile Card View */}
                <div className="space-y-3 sm:hidden">
                    {transactions.map((tx) => (
                        <Card key={tx.id} className="p-4 bg-slate-800/50 border-slate-700">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                                    <p className="font-semibold text-base break-words text-white">{tx.service}</p>
                                    <p className="text-sm text-slate-400">{tx.createdAt ? format(tx.createdAt.toDate(), 'PP') : 'N/A'}</p>
                                </div>
                                <Badge className={`flex-shrink-0 text-sm font-medium ${
                                    tx.status === 'successful' 
                                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                                }`}>
                                    {tx.status === 'successful' ? 'Paid' : 'Failed'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center text-lg font-bold text-white">
                                    <IndianRupee className="h-5 w-5 mr-1" />
                                    {new Intl.NumberFormat('en-IN').format(tx.amount)}
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled
                                    className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                                >
                                    View Invoice
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="rounded-md border border-slate-700 bg-slate-800/30 hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-700 hover:bg-slate-700/30">
                                <TableHead className="text-slate-300">Date</TableHead>
                                <TableHead className="text-slate-300">Service</TableHead>
                                <TableHead className="text-slate-300">Amount</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                                <TableHead className="text-right text-slate-300">Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {transactions.map((tx) => (
                                <TableRow key={tx.id} className="border-slate-700 hover:bg-slate-700/30">
                                    <TableCell className="font-medium whitespace-nowrap text-white">
                                        {tx.createdAt ? format(tx.createdAt.toDate(), 'PP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-white">{tx.service}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center text-white font-medium">
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {new Intl.NumberFormat('en-IN').format(tx.amount)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`font-medium ${
                                            tx.status === 'successful' 
                                                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                                        }`}>
                                            {tx.status === 'successful' ? 'Paid' : 'Failed'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled
                                            className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </ScrollArea>
        );
    };

    return <div className="w-full">{renderContent()}</div>;
};

export default TransactionHistory;