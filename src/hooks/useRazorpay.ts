
import { useEffect, useState } from 'react';

const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if ((window as any).Razorpay) {
      console.log('Razorpay already loaded');
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    const onScriptLoad = () => {
      console.log('Razorpay SDK loaded successfully');
      setIsLoaded(true);
    };
    
    const onScriptError = () => {
      console.error('Razorpay SDK could not be loaded.');
      setIsLoaded(false);
    };

    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return isLoaded;
};

export default useRazorpay;
