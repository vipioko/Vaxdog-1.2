import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedDelivery?: Timestamp;
  trackingNumber?: string;
}

export interface AdminOrder extends Order {
  customerName: string;
  customerPhone: string;
}

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD${timestamp}${random}`;
};

export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    },
    enabled: !!user,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Omit<Order, 'id' | 'userId' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const orderNumber = generateOrderNumber();
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      
      const newOrder = {
        ...orderData,
        userId: user.uid,
        orderNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(ordersRef, newOrder);
      return { id: docRef.id, ...newOrder };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
    },
  });

  return {
    orders,
    isLoading,
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
  };
};

// Admin orders hook
export const useAdminOrders = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all orders for admin
  const { data: adminOrders = [], isLoading } = useQuery<AdminOrder[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const allOrders: AdminOrder[] = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Get orders for this user
        const ordersRef = collection(db, 'users', userId, 'orders');
        const ordersSnapshot = await getDocs(ordersRef);
        
        ordersSnapshot.docs.forEach(orderDoc => {
          const orderData = orderDoc.data() as Order;
          allOrders.push({
            ...orderData,
            id: orderDoc.id,
            customerName: orderData.shippingAddress.fullName,
            customerPhone: orderData.shippingAddress.phone,
          });
        });
      }
      
      // Sort by creation date (newest first)
      return allOrders.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
    },
    enabled: !!isAdmin,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      orderId, 
      status, 
      trackingNumber 
    }: { 
      userId: string; 
      orderId: string; 
      status: Order['orderStatus']; 
      trackingNumber?: string;
    }) => {
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      const updateData: any = {
        orderStatus: status,
        updatedAt: serverTimestamp(),
      };
      
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
      
      return updateDoc(orderRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  return {
    adminOrders,
    isLoading,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
  };
};