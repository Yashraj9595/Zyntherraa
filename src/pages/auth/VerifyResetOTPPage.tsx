import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { userApi } from '../../utils/api';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyResetOTPPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from location state
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    } else {
      // If no email in state, redirect back
      navigate('/auth/forgot-password', { replace: true });
    }
  }, [location, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) {
      return; // Only allow digits
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userApi.verifyResetOTP(email, otpString);

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      if (response.data) {
        const data = response.data as any;
        // Navigate to reset password page with token
        navigate('/auth/reset-password', {
          replace: true,
          state: { resetToken: data.resetToken, email }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const response = await userApi.resendOTP(email, 'password-reset');
      if (response.error) {
        setError(response.error);
      } else {
        setError('');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        alert('OTP has been resent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bottom-nav-safe">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <h1 className="logo-primary text-2xl sm:text-3xl">ZYNTHERRAA</h1>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            We've sent a 6-digit OTP to <span className="font-medium">{email}</span>
          </p>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Please verify your identity to reset your password
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* OTP Form */}
        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter OTP
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="inline-flex items-center text-sm sm:text-base font-medium text-black hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              {resending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend OTP
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="text-center">
          <Link 
            to="/auth/forgot-password"
            className="inline-flex items-center text-sm sm:text-base font-medium text-black hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOTPPage;

