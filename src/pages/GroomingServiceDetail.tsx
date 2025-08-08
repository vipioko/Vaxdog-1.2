import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, IndianRupee, Clock, ChevronLeft, ChevronRight, Scissors } from 'lucide-react';
import ServiceBookingDialog from '@/components/ServiceBookingDialog';
import { useGroomingServices } from '@/hooks/useGroomingServices';
import { Skeleton } from '@/components/ui/skeleton';

const GroomingServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { services, isLoading } = useGroomingServices();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const service = services.find(s => s.id === serviceId);

  const handleBack = () => {
    navigate(-1);
  };

  const allImages = service ? [service.imageUrl, ...(service.galleryImages || [])].filter(Boolean) as string[] : [];

  const handlePrevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <Skeleton className="h-10 w-32 mb-6 bg-slate-800" />
        <Skeleton className="h-64 w-full mb-6 bg-slate-800" />
        <Skeleton className="h-10 w-full mb-4 bg-slate-800" />
        <Skeleton className="h-24 w-full bg-slate-800" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <Button onClick={handleBack} className="bg-purple-500 hover:bg-purple-600">
            Go Back
          </Button>
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
        <h1 className="text-lg font-semibold truncate mx-4">{service.name}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Service Images Gallery */}
      <div className="relative">
        <div className="relative h-80 sm:h-96 overflow-hidden">
          {allImages.length > 0 ? (
            <img 
              src={allImages[currentImageIndex]} 
              alt={service.name}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400">
              No Image Available
            </div>
          )}
          
          {allImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="p-4 bg-slate-800/50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex 
                      ? 'border-purple-500' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${service.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Info */}
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{service.name}</h1>
          <div className="flex items-center justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              <IndianRupee className="inline-block h-6 w-6 mr-1" />{service.price.toFixed(2)}
            </div>
            <div className="flex items-center text-slate-400 text-sm">
              <Clock className="h-4 w-4 mr-1" />{service.duration} min
            </div>
          </div>
        </div>

        <ServiceBookingDialog serviceType="grooming" service={service}>
          <Button 
            className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 font-semibold"
          >
            <Scissors className="h-5 w-5 mr-2" />
            Book Home Grooming
          </Button>
        </ServiceBookingDialog>

        {service.description && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-white">Service Details</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {service.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">What to Expect</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>• Professional groomers at your doorstep</p>
              <p>• High-quality grooming products</p>
              <p>• Personalized care for your pet</p>
              <p>• Convenient and stress-free experience</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroomingServiceDetail;