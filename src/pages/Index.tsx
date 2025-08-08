import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/firebase';
import { toast } from 'sonner';

const Index = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize RecaptchaVerifier once when component mounts
    const initializeRecaptcha = () => {
      if (!recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
              // reCAPTCHA solved
            }
          });
        } catch (error) {
          console.error('Error initializing reCAPTCHA:', error);
        }
      }
    };

    // Initialize immediately since useEffect ensures DOM is ready
    initializeRecaptcha();

    return () => {
      // Clean up RecaptchaVerifier on unmount
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
        toast.error('Please enter a valid phone number with country code (e.g., +1234567890).');
        return;
    }
    
    if (!recaptchaVerifierRef.current) {
        toast.error('reCAPTCHA not initialized. Please refresh the page and try again.');
        return;
    }

    setLoading(true);
    try {
        const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
        setConfirmationResult(result);
        toast.success('OTP sent successfully!');
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        if (error.code === 'auth/too-many-requests') {
          toast.error('Too many requests. Please wait a while before trying again.');
        } else {
          toast.error(`Failed to send OTP. Please check the number or try again later.`);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      const otpString = otp.join('');
      if (!otpString || otpString.length !== 6) {
          toast.error('Please enter a valid 6-digit OTP.');
          return;
      }
      if (!confirmationResult) {
          toast.error('Please request an OTP first.');
          return;
      }
      setLoading(true);
      try {
          await confirmationResult.confirm(otpString);
          toast.success('Logged in successfully! Redirecting...');
          // Redirection is now handled automatically by the main App component
          // based on the user's admin status from the AuthProvider.
      } catch (error: any) {
          console.error("Error verifying OTP:", error);
          toast.error(`Invalid OTP. Please try again.`);
          setLoading(false);
      }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If user starts typing without +91, automatically add it
    if (value && !value.startsWith('+')) {
      if (value.startsWith('91')) {
        value = '+' + value;
      } else if (/^\d/.test(value)) {
        value = '+91' + value;
      }
    }
    
    setPhoneNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div id="recaptcha-container"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-sm relative z-10">
        {/* Logo/Icon Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl"></div>
            <div className="absolute inset-2 bg-slate-800 rounded-2xl flex items-center justify-center">
              <div className="text-4xl">🐕</div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {!confirmationResult ? 'Hello Guest!' : 'Verify OTP'}
          </h1>
          <p className="text-slate-400 text-base">
            {!confirmationResult ? 'Welcome to the Pawlly care' : 'Enter the verification code'}
          </p>
        </div>

        {/* Sign In Form Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
          {!confirmationResult ? (
            <>
              <form className="space-y-6" onSubmit={handleSendOtp}>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                      <span className="text-lg">🇮🇳</span>
                      <span className="text-sm text-slate-400 font-medium">+91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Enter your mobile number"
                      className="pl-20 h-14 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl focus:border-purple-500 focus:ring-purple-500/20 text-base"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  Not registered? <span className="text-purple-400 underline cursor-pointer hover:text-purple-300 transition-colors">Register Now</span>
                </p>
              </div>

              <div className="mt-8 flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                <span className="px-4 text-slate-400 text-sm">Or sign in with</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-6 h-14 bg-slate-700/30 border-slate-600 text-white hover:bg-slate-600/50 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900">G</span>
                  </div>
                  Sign In With Google
                </div>
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-2xl">
                    <span className="text-2xl">🇮🇳</span>
                    <span className="text-lg font-medium text-white">{phoneNumber}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter the 6-digit verification code<br />sent to your mobile number
                </p>
              </div>

              <form className="space-y-8" onSubmit={handleVerifyOtp}>
                <div className="flex justify-center">
                  <div className="grid grid-cols-6 gap-3 w-full max-w-xs">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-full h-16 text-center text-xl font-bold bg-slate-700/50 border-2 border-slate-600 text-white rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-200"
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Log In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { 
                    setConfirmationResult(null); 
                    setOtp(['', '', '', '', '', '']); 
                    setPhoneNumber(''); 
                  }} 
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition-all duration-200" 
                  disabled={loading}
                >
                  Change number
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-slate-500 mt-8 text-center opacity-75">
          Secure sign-in powered by Firebase
        </p>
      </div>
    </div>
  );
};

export default Index;