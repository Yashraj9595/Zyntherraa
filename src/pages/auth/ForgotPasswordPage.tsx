import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../utils/api';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setResetToken(null);
    
    try {
      const response = await userApi.forgotPassword(email);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      
      if (response.data) {
        const data = response.data as any;
        // Redirect to OTP verification page
        navigate('/auth/verify-reset-otp', {
          replace: true,
          state: { email: data.email || email }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
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
            Forgot Password
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Check your email!</p>
                <p className="mt-1">
                  If an account with that email exists, password reset instructions have been sent.
                </p>
                {resetToken && (
                  <div className="mt-3 p-3 bg-gray-100 rounded border border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">Development Mode - Reset Token:</p>
                    <p className="text-xs font-mono break-all text-gray-800">{resetToken}</p>
                    <Link 
                      to={`/auth/reset-password?token=${resetToken}`}
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Click here to reset password
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Send Reset Instructions
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center">
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-sm sm:text-base font-medium text-black hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

