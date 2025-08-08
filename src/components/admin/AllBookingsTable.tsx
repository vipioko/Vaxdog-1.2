
import React, { useState, useMemo, useEffect } from 'react';
import { useAllTransactions, AdminTransaction } from '@/hooks/useAllTransactions';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import RemindersSkeleton from '@/components/reminders/RemindersSkeleton';
import { IndianRupee, User, Calendar, Phone, Home, UserCircle, Heart, Cake, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BookingsDataTable } from './BookingsDataTable';
import { columns } from './columns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ColumnFiltersState,
    SortingState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem, // Keep this import if it's used elsewhere in the file
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAdminReminders } from '@/hooks/useAdminReminders';
import { formatDistanceToNow } from 'date-fns';

const AllBookingsTable: React.FC = () => {
    const { transactions, isLoading, error } = useAllTransactions();
    const [selectedBooking, setSelectedBooking] = useState<AdminTransaction | null>(null);
    const { markBookingAsComplete, isMarkingComplete } = useAdminReminders();
    const isMobile = useIsMobile();
    const { user } = useAuth();

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    // Add debugging for current user's data access
    useEffect(() => {
        const checkCurrentUserAccess = async () => {
            if (user?.uid) {
                console.log('🔍 DEBUGGING: Checking current user access...');
                console.log('Current user UID:', user.uid);
                
                try {
                    // Try to access current user's own data
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        console.log('✅ Current user document exists:', userDoc.data());
                        
                        // Try to access their transactions
                        const transactionsRef = collection(db, 'users', user.uid, 'transactions');
                        const transactionsSnapshot = await getDocs(transactionsRef);
                        console.log(`Current user has ${transactionsSnapshot.docs.length} transactions`);
                        
                        transactionsSnapshot.docs.forEach((doc, index) => {
                            console.log(`Current user transaction ${index + 1}:`, { id: doc.id, data: doc.data() });
                        });
                    } else {
                        console.log('❌ Current user document does not exist in Firestore');
                        console.log('This means the user signed up but their profile was never created in Firestore');
                    }
                } catch (error) {
                    console.error('❌ Error accessing current user data:', error);
                }
            }
        };

        checkCurrentUserAccess();
    }, [user]);

    const handleMarkAsComplete = () => {
        if (selectedBooking?.reminderId && selectedBooking?.userId) {
            markBookingAsComplete(selectedBooking.userId, selectedBooking.reminderId);
            setSelectedBooking(null);
        }
    };

    const tableColumns = useMemo(() => columns(setSelectedBooking), []);

    const table = useReactTable({
        data: transactions,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
          sorting,
          columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    if (isLoading) return <RemindersSkeleton />;
    
    if (error) {
        console.error("Error fetching all bookings:", error);
        return (
            <div className="text-center py-10">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium mb-2">Error fetching bookings</p>
                <p className="text-sm text-muted-foreground mb-4">Make sure you've set up the Firestore index and security rules.</p>
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg max-w-md mx-auto">
                    <p className="font-medium mb-2">Possible issues:</p>
                    <ul className="text-left space-y-1">
                        <li>• Firestore security rules blocking admin access</li>
                        <li>• Missing user documents in Firestore</li>
                        <li>• Authentication vs Firestore user mismatch</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-10">
                <UserCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No bookings found</h3>
                <div className="text-sm text-muted-foreground space-y-2 mb-4">
                    <p>This could mean:</p>
                    <div className="bg-muted/30 p-3 rounded-lg text-xs max-w-md mx-auto">
                        <ul className="text-left space-y-1">
                            <li>• No users have completed bookings yet</li>
                            <li>• Users created accounts but never made transactions</li>
                            <li>• Firestore security rules are blocking access</li>
                            <li>• User documents aren't being created in Firestore</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 max-w-md mx-auto">
                    <p className="font-medium mb-1">💡 Debugging Tip:</p>
                    <p>Check the browser console for detailed logs about user data access and security rules.</p>
                </div>
            </div>
        );
    }

    const FilterComponent = (
        <div className="flex items-center py-4 gap-2">
            <Input
                placeholder="Filter by customer name..."
                value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("customerName")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        Filter by Status
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={table.getColumn("status")?.getFilterValue() === "successful"}
                        onCheckedChange={(value) =>
                            table.getColumn("status")?.setFilterValue(value ? "successful" : undefined)
                        }
                    >
                        Paid
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={table.getColumn("status")?.getFilterValue() === "failed"}
                        onCheckedChange={(value) =>
                            table.getColumn("status")?.setFilterValue(value ? "failed" : undefined)
                        }
                    >
                        Failed
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <Button variant="ghost" className="w-full justify-start font-normal h-8 px-2" onClick={() => table.getColumn("status")?.setFilterValue(undefined)}>Clear filter</Button>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const PaginationComponent = (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
        </div>
    );

    return (
        <>
            {isMobile ? (
                <div>
                    {FilterComponent}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {table.getRowModel().rows.map(({ original: tx }) => (
                            <Card key={tx.id} onClick={() => setSelectedBooking(tx)} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="truncate text-lg">{tx.customer?.name || tx.service}</CardTitle>
                                    <CardDescription>{tx.createdAt ? format(tx.createdAt.toDate(), 'PP') : 'N/A'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <div className="font-semibold flex items-center">
                                        <IndianRupee className="h-4 w-4 mr-0.5" />
                                        {new Intl.NumberFormat('en-IN').format(tx.amount)}
                                    </div>
                                    <Badge variant={tx.status === 'successful' ? 'default' : 'destructive'} className={`${tx.status === 'successful' ? 'bg-green-600 hover:bg-green-600/90' : ''} whitespace-nowrap`}>
                                        {tx.status === 'successful' ? 'Paid' : 'Failed'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {table.getRowModel().rows.length === 0 && <p className="text-center text-muted-foreground py-10">No results.</p>}
                    {table.getPageCount() > 1 && PaginationComponent}
                </div>
            ) : (
                <div>
                    {FilterComponent}
                    <BookingsDataTable table={table} />
                    {table.getPageCount() > 1 && PaginationComponent}
                </div>
            )}


            <Dialog open={!!selectedBooking} onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
                <DialogContent className="max-w-[90vw] sm:max-w-lg rounded-lg">
                    {selectedBooking && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-balance">{selectedBooking.service}</DialogTitle>
                                <DialogDescription>Booking Details</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex items-center text-2xl font-bold">
                                    <IndianRupee className="h-6 w-6 mr-1" />
                                    {new Intl.NumberFormat('en-IN').format(selectedBooking.amount)}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>{selectedBooking.createdAt ? format(selectedBooking.createdAt.toDate(), 'PPP p') : 'N/A'}</span>
                                </div>
                                
                                {selectedBooking.petDetails && (
                                    <div className="border rounded-lg p-3 bg-muted/30">
                                        <h4 className="font-semibold flex items-center mb-2">
                                            <Heart className="h-4 w-4 mr-2" />
                                            Pet Details
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">Name:</span> {selectedBooking.petDetails.name}</p>
                                            <p><span className="font-medium">Type:</span> {selectedBooking.petDetails.petType}</p>
                                            <p><span className="font-medium">Breed:</span> {selectedBooking.petDetails.breed}</p>
                                            <p><span className="font-medium">Age:</span> {selectedBooking.petDetails.age} years</p>
                                            {selectedBooking.petDetails.dateOfBirth && (
                                                <div className="flex items-center">
                                                    <Cake className="h-3 w-3 mr-1" />
                                                    <span className="font-medium">D.O.B:</span> 
                                                    <span className="ml-1">{format(new Date(selectedBooking.petDetails.dateOfBirth), 'MMM d, yyyy')}</span>
                                                </div>
                                            )}
                                            {selectedBooking.petDetails.weight !== undefined && (
                                                <p><span className="font-medium">Weight:</span> {selectedBooking.petDetails.weight} kg</p>
                                            )}
                                            {selectedBooking.petDetails.sex && (
                                                <p><span className="font-medium">Sex:</span> {selectedBooking.petDetails.sex}</p>
                                            )}
                                            {selectedBooking.petDetails.aggressionLevel && (
                                                <p><span className="font-medium">Aggression Level:</span> {selectedBooking.petDetails.aggressionLevel}</p>
                                            )}
                                            {selectedBooking.petDetails.matingInterest !== undefined && (
                                                <p><span className="font-medium">Mating Interest:</span> {selectedBooking.petDetails.matingInterest ? 'Yes' : 'No'}</p>
                                            )}
                                            {selectedBooking.petDetails.sex === 'Female' && selectedBooking.petDetails.pregnancyCount !== undefined && (
                                                <p><span className="font-medium">Times Pregnant:</span> {selectedBooking.petDetails.pregnancyCount}</p>
                                            )}
                                            {selectedBooking.petDetails.sex === 'Female' && selectedBooking.petDetails.pupCount !== undefined && (
                                                <p><span className="font-medium">Total Offspring:</span> {selectedBooking.petDetails.pupCount}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.petDetails?.vaccinationScheduleImages && selectedBooking.petDetails.vaccinationScheduleImages.length > 0 && (
                                    <div className="border rounded-lg p-3 bg-muted/30">
                                        <h4 className="font-semibold flex items-center mb-2">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Vaccination Schedule Images
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {selectedBooking.petDetails.vaccinationScheduleImages.map((imageUrl, index) => (
                                                <a 
                                                    key={index} 
                                                    href={imageUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="block relative group"
                                                >
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={`Vaccination Schedule ${index + 1}`} 
                                                        className="w-full h-24 object-cover rounded-md border border-gray-300 group-hover:opacity-75 transition-opacity" 
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                        <Eye className="h-6 w-6 text-white" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.vaccines && selectedBooking.vaccines.length > 0 && (
                                    <div className="border rounded-lg p-3 bg-muted/30">
                                        <h4 className="font-semibold flex items-center mb-2">
                                            <Stethoscope className="h-4 w-4 mr-2" />
                                            Vaccines Administered
                                        </h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {selectedBooking.vaccines.map((vaccine, index) => (
                                                <li key={index}>{vaccine.name} (₹{vaccine.price.toFixed(2)})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedBooking.customer?.name && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <UserCircle className="h-4 w-4 mr-2" />
                                        <span>Customer: {selectedBooking.customer.name}</span>
                                    </div>
                                )}

                                {selectedBooking.customer?.phone && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4 mr-2" />
                                        <span>Contact: {selectedBooking.customer.phone}</span>
                                    </div>
                                )}

                                {selectedBooking.customer?.address && (
                                    <div className="flex items-start text-sm text-muted-foreground">
                                        <Home className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="break-words">Address: {`${selectedBooking.customer.address}, ${selectedBooking.customer.city} - ${selectedBooking.customer.postalCode}`}</span>
                                    </div>
                                )}

                                <div className="flex items-center text-sm text-muted-foreground">
                                    <User className="h-4 w-4 mr-2" />
                                    <span className="font-mono text-xs break-all">User ID: {selectedBooking.userId}</span>
                                </div>
                                
                                <div className="text-sm text-muted-foreground">
                                    Payment ID: <span className="font-mono text-xs break-all">{selectedBooking.paymentId}</span>
                                </div>
                                
                                <Badge variant={selectedBooking.status === 'successful' ? 'default' : 'destructive'} className={`${selectedBooking.status === 'successful' ? 'bg-green-600 hover:bg-green-600/90' : ''} whitespace-nowrap`}>
                                    Status: {selectedBooking.status === 'successful' ? 'Paid' : 'Failed'}
                                </Badge>
                                
                            </div>
                            <DialogFooter className="flex gap-2">
                                <Button onClick={() => setSelectedBooking(null)} variant="outline">Close</Button>
                                {selectedBooking.status === 'successful' && selectedBooking.reminderId && (
                                    <Button 
                                        onClick={handleMarkAsComplete}
                                        disabled={isMarkingComplete}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {isMarkingComplete ? 'Marking Complete...' : 'Mark Home Visit Done'}
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AllBookingsTable;
