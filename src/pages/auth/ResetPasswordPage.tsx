import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { userApi } from '../../utils/api';
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Get resetToken from location state
    const state = location.state as { resetToken?: string };
    if (state?.resetToken) {
      setResetToken(state.resetToken);
    } else {
      // If no token in state, redirect back
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [location, navigate]);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetToken) {
      setError('Invalid reset token');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await userApi.resetPassword(resetToken, newPassword);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      
      if (response.data) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bottom-nav-safe">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center py-2.5 sm:py-3 px-4 sm:px-6 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bottom-nav-safe">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <h1 className="logo-primary text-2xl sm:text-3xl">ZYNTHERRAA</h1>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Form */}
        {resetToken ? (
          <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Enter new password (min. 6 characters)"
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>
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
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Invalid or missing reset token.</p>
            <Link
              to="/auth/forgot-password"
              className="inline-flex items-center text-sm sm:text-base font-medium text-black hover:text-gray-700 transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
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

export default ResetPasswordPage;

