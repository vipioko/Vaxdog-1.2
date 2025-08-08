import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MyDogs from "./pages/MyDogs";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Bookings from "./pages/Bookings";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Admin from "./pages/Admin";
import DoctorPanel from "./pages/DoctorPanel";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import DoctorLayout from "./components/doctor/DoctorLayout";
import DogProfile from "./pages/DogProfile";
import GroomingServiceDetail from "./pages/GroomingServiceDetail";
import PetHostelServiceDetail from "./pages/PetHostelServiceDetail";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./providers/AuthProvider";

const queryClient = new QueryClient();

const AppRoutes: React.FC = () => {
  const { user, loading, isAdmin, userRole, isPetOwner, isDoctor } = useAuth();
  const [reminderDueSoonDays, setReminderDueSoonDays] = useState(30);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <h1 className="text-2xl font-semibold animate-pulse">Loading VaxDog...</h1>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <Index /> : <Navigate to={
        isAdmin ? "/admin" : 
        isDoctor ? "/doctor" : 
        isPetOwner ? "/home" : 
        "/home"
      } replace />} />
      
      {user ? (
        isAdmin ? (
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        ) : isDoctor ? (
          <Route element={<DoctorLayout />}>
            <Route path="/doctor" element={<DoctorPanel />} />
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Route>
        ) : (
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-dogs" element={<MyDogs reminderDueSoonDays={reminderDueSoonDays} />} />
            <Route path="/my-dogs/:dogName" element={<DogProfile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product-detail" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/grooming-services/:serviceId" element={<GroomingServiceDetail />} />
            <Route path="/pet-hostel-services/:serviceId" element={<PetHostelServiceDetail />} />
            <Route path="/profile" element={<Profile reminderDueSoonDays={reminderDueSoonDays} setReminderDueSoonDays={setReminderDueSoonDays} />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        )
      ) : (
        <Route path="*" element={<Navigate to="/" replace />} />
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;