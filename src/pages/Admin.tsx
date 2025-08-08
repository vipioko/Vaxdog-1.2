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

const Admin = () => {
  return (
    <Tabs defaultValue="doctors" className="w-full">
      <TabsList className="grid w-full grid-cols-8 text-xs">
        <TabsTrigger value="doctors">Doctors</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="products">Shop Products</TabsTrigger>
        <TabsTrigger value="slots">Manage Slots</TabsTrigger>
      </TabsList>
      
      <TabsContent value="doctors" className="mt-4">
        <DoctorManagement />
      </TabsContent>
      
      <TabsContent value="assignments" className="mt-4">
        <BookingAssignment />
      </TabsContent>
      
      <TabsContent value="orders" className="mt-4">
        <OrderManagement />
      </TabsContent>
      
      <TabsContent value="bookings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>All User Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <AllBookingsTable />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="vaccines" className="mt-4">
        <ProductManagement />
      </TabsContent>
      
      <TabsContent value="categories" className="mt-4">
        <CategoryManagement />
      </TabsContent>
      
      <TabsContent value="products" className="mt-4">
        <ShopProductManagement />
      </TabsContent>
      
      <TabsContent value="slots" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Manage Booking Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingSlotsManager />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default Admin;