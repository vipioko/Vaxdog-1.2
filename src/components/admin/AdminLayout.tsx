import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Settings } from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully.");
            navigate('/');
        } catch (error) {
            toast.error("Failed to log out.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-lg">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">VaxDog Admin</h1>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500 transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
