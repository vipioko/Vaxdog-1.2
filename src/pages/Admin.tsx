import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllBookingsTable from '@/components/admin/AllBookingsTable';
import ProductManagement from '@/components/admin/ProductManagement';
import BookingSlotsManager from '@/components/admin/BookingSlotsManager';
import CategoryManagement from '@/components/admin/CategoryManagement';
import ShopProductManagement from '@/components/admin/ShopProductManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import DoctorManagement from '@/components/admin/DoctorManagement';
import BookingAssignment from '@/components/admin/BookingAssignment';
import GroomingServiceManagement from '@/components/admin/GroomingServiceManagement';
import PetHostelManagement from '@/components/admin/PetHostelManagement';

const Admin = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="text-3xl">⚡</div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100">Manage your VaxDog platform</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="flex w-full overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide text-sm bg-slate-800/50 border border-slate-700 rounded-lg p-1 gap-1">
          <TabsTrigger 
            value="doctors" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Doctors
          </TabsTrigger>
          <TabsTrigger 
            value="assignments" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Assignments
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger 
            value="bookings" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="vaccines" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Vaccines
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Shop Products
          </TabsTrigger>
          <TabsTrigger 
            value="slots" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Manage Slots
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 data-[state=active]:shadow-md hover:bg-slate-700/80 transition-colors duration-200 rounded-md px-4 py-2 flex-shrink-0"
          >
            Services
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="doctors" className="mt-6">
          <DoctorManagement />
        </TabsContent>
        
        <TabsContent value="assignments" className="mt-6">
          <BookingAssignment />
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <OrderManagement />
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">📋</div>
                </div>
                All User Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AllBookingsTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vaccines" className="mt-6">
          <ProductManagement />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <CategoryManagement />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ShopProductManagement />
        </TabsContent>
        
        <TabsContent value="slots" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">⏰</div>
                </div>
                Manage Booking Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BookingSlotsManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">🛎️</div>
                </div>
                Service Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grooming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 mb-6">
                  <TabsTrigger 
                    value="grooming" 
                    className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-slate-300"
                  >
                    Grooming Services
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hostel" 
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300"
                  >
                    Pet Boarding
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="grooming" className="mt-0">
                  <GroomingServiceManagement />
                </TabsContent>
                
                <TabsContent value="hostel" className="mt-0">
                  <PetHostelManagement />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
