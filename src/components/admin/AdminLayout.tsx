
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
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
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-background border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold">VaxDog Admin</h1>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
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

export default AdminLayout;
