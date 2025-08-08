import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Calendar, 
  Settings, 
  Users,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import ServiceManagement from '@/components/doctor/ServiceManagement';
import DoctorBookings from '@/components/doctor/DoctorBookings';
import DoctorProfile from '@/components/doctor/DoctorProfile';
import { useAuth } from '@/providers/AuthProvider';

const DoctorPanel = () => {
  const { user } = useAuth();

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.phoneNumber) {
      const lastFour = user.phoneNumber.slice(-4);
      return `Dr. ${lastFour}`;
    }
    return 'Doctor';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {getUserName()}</h1>
            <p className="text-blue-100">Manage your veterinary services and appointments</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">Today's Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">Services Offered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger 
            value="bookings" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300"
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            My Services
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-6">
          <DoctorBookings />
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          <ServiceManagement />
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <DoctorProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorPanel;