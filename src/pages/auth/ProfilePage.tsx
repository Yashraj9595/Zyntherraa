import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../utils/api';
import { Loader2, LogOut, User as UserIcon, Mail, Calendar, Shield, Phone } from 'lucide-react';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userApi.getProfile();
        if (response.data) {
          setProfile(response.data as ProfileData);
        } else {
          setError(response.error || 'Failed to fetch profile');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 bottom-nav-safe">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-black mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 bottom-nav-safe">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || 'N/A';
  const displayRole = profile?.role || user?.role || 'customer';
  const isAdmin = displayRole === 'admin';
  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Not available';

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 bottom-nav-safe">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          {/* Profile Header */}
          <div className="px-4 sm:px-6 py-5 sm:py-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-black flex items-center justify-center">
                  <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{displayName}</h3>
                <p className="text-sm sm:text-base text-gray-600 truncate">{displayEmail}</p>
              </div>
              {isAdmin && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Admin
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Full name
                </dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                  {displayName}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email address
                </dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                  {displayEmail}
                </dd>
              </div>
              {profile?.phone && (
                <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile Number
                  </dt>
                  <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile.phone}
                  </dd>
                </div>
              )}
              <div className={`px-4 sm:px-6 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 ${profile?.phone ? 'bg-gray-50' : 'bg-white'}`}>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Account type
                </dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${
                    isAdmin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isAdmin ? 'Administrator' : 'Customer'}
                  </span>
                </dd>
              </div>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 ${profile?.phone ? 'bg-white' : 'bg-gray-50'}`}>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since
                </dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                  {memberSince}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/account/settings')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-sm text-gray-600">Update your profile and password</p>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Order History</h3>
            <p className="text-sm text-gray-600">View your past orders</p>
          </button>
          <button
            onClick={() => navigate('/addresses')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Saved Addresses</h3>
            <p className="text-sm text-gray-600">Manage your delivery addresses</p>
          </button>
          <button
            onClick={() => navigate('/wishlist')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Wishlist</h3>
            <p className="text-sm text-gray-600">View your saved items</p>
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/shop')}
            className="flex-1 sm:flex-none inline-flex justify-center items-center py-2.5 sm:py-3 px-4 sm:px-6 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
          >
            Continue Shopping
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="flex-1 sm:flex-none inline-flex justify-center items-center py-2.5 sm:py-3 px-4 sm:px-6 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none inline-flex justify-center items-center py-2.5 sm:py-3 px-4 sm:px-6 border border-transparent shadow-sm text-sm sm:text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
