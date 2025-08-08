import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  IndianRupee,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const MyOrders = () => {
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigate('/profile');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="flex items-center justify-between p-4 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10">
          <Button size="icon" variant="ghost" className="text-white hover:bg-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Orders</h1>
          <div className="w-10" />
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10">
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-white hover:bg-slate-700"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">My Orders</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 pl-10 rounded-xl h-12"
          />
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {orders.length === 0 
                ? 'Your orders will appear here once you make a purchase' 
                : 'Try adjusting your search terms'
              }
            </p>
            {orders.length === 0 && (
              <Button 
                onClick={() => navigate('/shop')} 
                className="bg-purple-500 hover:bg-purple-600"
              >
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">#{order.orderNumber}</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-slate-400 hover:text-white"
                          onClick={() => copyToClipboard(order.orderNumber)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {order.createdAt ? format(order.createdAt.toDate(), 'MMM d, yyyy, p') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1 capitalize">{order.orderStatus}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-slate-500" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                          <span className="text-slate-400 text-xs">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Total Amount</p>
                      <div className="flex items-center text-white font-semibold">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {order.total.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Payment</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 
                           order.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                        </Badge>
                        <span className="text-slate-400 text-xs">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.trackingNumber && (
                    <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Tracking Number</p>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{order.trackingNumber}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-slate-400 hover:text-white"
                          onClick={() => copyToClipboard(order.trackingNumber!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-white">Order Details - #{order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Order Status */}
                          <div>
                            <h4 className="text-white font-medium mb-2">Order Status</h4>
                            <Badge className={getStatusColor(order.orderStatus)}>
                              {getStatusIcon(order.orderStatus)}
                              <span className="ml-1 capitalize">{order.orderStatus}</span>
                            </Badge>
                          </div>

                          {/* Items */}
                          <div>
                            <h4 className="text-white font-medium mb-3">Items Ordered</h4>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                                  <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-8 w-8 text-slate-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-white font-medium">{item.name}</h5>
                                    <p className="text-slate-400 text-sm">Quantity: {item.quantity}</p>
                                  </div>
                                  <div className="text-white font-medium">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              Shipping Address
                            </h4>
                            <div className="p-3 bg-slate-700/30 rounded-lg">
                              <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
                              <p className="text-slate-300 text-sm">{order.shippingAddress.phone}</p>
                              <p className="text-slate-300 text-sm mt-1">
                                {order.shippingAddress.address}
                                {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
                              </p>
                              <p className="text-slate-300 text-sm">
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                              </p>
                            </div>
                          </div>

                          {/* Payment Details */}
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Payment Details
                            </h4>
                            <div className="space-y-2 p-3 bg-slate-700/30 rounded-lg">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Subtotal</span>
                                <span className="text-white">₹{order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Shipping</span>
                                <span className="text-white">₹{order.shippingFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t border-slate-600 pt-2">
                                <span className="text-white">Total</span>
                                <span className="text-white">₹{order.total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Payment Method</span>
                                <span className="text-white capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Payment Status</span>
                                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                  {order.paymentStatus === 'paid' ? 'Paid' : 
                                   order.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                                </Badge>
                              </div>
                              {order.razorpayPaymentId && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Payment ID</span>
                                  <span className="text-white font-mono text-xs">{order.razorpayPaymentId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {order.orderStatus === 'shipped' && order.trackingNumber && (
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                        Track Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;