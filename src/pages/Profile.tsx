import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import TransactionHistory from '@/components/profile/TransactionHistory';
import { Receipt, LogOut, Settings, User as UserIcon, Package } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  reminderDueSoonDays: number;
  setReminderDueSoonDays: React.Dispatch<React.SetStateAction<number>>;
}

const Profile: React.FC<ProfileProps> = ({ reminderDueSoonDays, setReminderDueSoonDays }) => {
  const [days, setDays] = useState(reminderDueSoonDays);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSave = () => {
    if (days > 0) {
      setReminderDueSoonDays(days);
      toast.success('Reminder settings saved!');
    } else {
      toast.error('Please enter a valid number of days.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info('You have been logged out.');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.phoneNumber) {
      const lastFour = user.phoneNumber.slice(-4);
      return `User ${lastFour}`;
    }
    return 'Pet Parent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Profile & Settings</h1>
        
        {/* User Info Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{getUserName()}</h2>
                <p className="text-slate-400">{user?.phoneNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Orders Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-white">
              <Package className="mr-2 h-5 w-5 text-purple-400" />
              My Orders
            </CardTitle>
            <CardDescription className="text-slate-400">
              View and track your orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => navigate('/my-orders')}
            >
              View Orders
            </Button>
          </CardContent>
        </Card>
        
        {/* Transaction History */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-white">
              <Receipt className="mr-2 h-5 w-5 text-purple-400" />
              Transaction History
            </CardTitle>
            <CardDescription className="text-slate-400">
              View your past payments and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-600">View Transactions</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-[95vw] sm:max-w-3xl bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Transaction History</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    A record of all your payments.
                  </DialogDescription>
                </DialogHeader>
                <TransactionHistory />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Settings className="mr-2 h-5 w-5 text-purple-400" />
              Reminder Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Set how many days in advance you want a "due soon" notification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="days" className="text-white">Due Soon Threshold (in days)</Label>
              <Input
                type="number"
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                placeholder="e.g., 30"
                min="1"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600">Save Changes</Button>
          </CardFooter>
        </Card>

        {/* Account */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Account</CardTitle>
            <CardDescription className="text-slate-400">
              Manage your account details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              This is where you can manage your account.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;