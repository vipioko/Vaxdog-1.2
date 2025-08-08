import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const DoctorLayout: React.FC = () => {
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
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">VaxDog Doctor</h1>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default DoctorLayout;