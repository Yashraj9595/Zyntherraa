import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Bell, 
  Save,
  Settings,
  Clock,
  DollarSign,
  FileText,
  HeadphonesIcon,
  RotateCcw,
  Truck,
  Ruler,
  Shield,
  Cookie
} from 'lucide-react';

// Import Customer Service Components
import ContactUs from './Customer Service/ContactUs';
import FAQ from './Customer Service/FAQ';
import ReturnsExchanges from './Customer Service/ReturnsExchanges';
import ShippingInfo from './Customer Service/ShippingInfo';
import SizeGuide from './Customer Service/SizeGuide';

// Import Legal Document Components
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import CookiePolicy from './CookiePolicy';

interface CompanyInfo {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface BusinessSettings {
  currency: string;
  timezone: string;
  taxRate: string;
  gstNumber: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderAlerts: boolean;
  lowStockAlerts: boolean;
  customerMessages: boolean;
}



export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);

  // Company Information State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Zyntherraa',
    description: 'Premium Indian Clothing Store specializing in traditional and contemporary ethnic wear',
    email: 'info@zyntherraa.com',
    phone: '+91 98765 43210',
    website: 'www.zyntherraa.com',
    address: {
      street: '123 Fashion Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  });

  // Business Settings State
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    taxRate: '18',
    gstNumber: '27AAAAA0000A1Z5'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    customerMessages: true
  });



  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'business', label: 'Business Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'contact', label: 'Contact Us', icon: Phone, component: ContactUs },
    { id: 'faq', label: 'FAQ', icon: HeadphonesIcon, component: FAQ },
    { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw, component: ReturnsExchanges },
    { id: 'shipping', label: 'Shipping Info', icon: Truck, component: ShippingInfo },
    { id: 'size-guide', label: 'Size Guide', icon: Ruler, component: SizeGuide },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, component: PrivacyPolicy },
    { id: 'terms', label: 'Terms of Service', icon: FileText, component: TermsOfService },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie, component: CookiePolicy }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your store settings and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation - Fixed/Sticky */}
        <div className="w-64 flex-shrink-0">
          <nav className="sticky top-8 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-card rounded-lg border border-border p-6">
            {/* Company Information Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="text-primary" size={24} />
                  <h2 className="text-2xl font-semibold text-foreground">Company Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                          type="email"
                          value={companyInfo.email}
                          onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                          type="tel"
                          value={companyInfo.phone}
                          onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                          type="url"
                          value={companyInfo.website}
                          onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={companyInfo.description}
                        onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <MapPin className="inline mr-2" size={16} />
                        Address
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={companyInfo.address.street}
                          onChange={(e) => setCompanyInfo({
                            ...companyInfo,
                            address: {...companyInfo.address, street: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="City"
                            value={companyInfo.address.city}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              address: {...companyInfo.address, city: e.target.value}
                            })}
                            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={companyInfo.address.state}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              address: {...companyInfo.address, state: e.target.value}
                            })}
                            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            value={companyInfo.address.zipCode}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              address: {...companyInfo.address, zipCode: e.target.value}
                            })}
                            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="Country"
                            value={companyInfo.address.country}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              address: {...companyInfo.address, country: e.target.value}
                            })}
                            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Settings Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="text-primary" size={24} />
                  <h2 className="text-2xl font-semibold text-foreground">Business Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <DollarSign className="inline mr-2" size={16} />
                        Currency
                      </label>
                      <select
                        value={businessSettings.currency}
                        onChange={(e) => setBusinessSettings({...businessSettings, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Clock className="inline mr-2" size={16} />
                        Timezone
                      </label>
                      <select
                        value={businessSettings.timezone}
                        onChange={(e) => setBusinessSettings({...businessSettings, timezone: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={businessSettings.taxRate}
                        onChange={(e) => setBusinessSettings({...businessSettings, taxRate: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={businessSettings.gstNumber}
                        onChange={(e) => setBusinessSettings({...businessSettings, gstNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter GST Number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="text-primary" size={24} />
                  <h2 className="text-2xl font-semibold text-foreground">Notification Preferences</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">SMS Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">Order Alerts</h3>
                      <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderAlerts}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          orderAlerts: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">Low Stock Alerts</h3>
                      <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.lowStockAlerts}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          lowStockAlerts: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">Customer Messages</h3>
                      <p className="text-sm text-muted-foreground">Get notified about customer inquiries</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.customerMessages}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          customerMessages: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Component Rendering */}
            {tabs.map((tab) => {
              if (tab.component && activeTab === tab.id) {
                const Component = tab.component;
                return <Component key={tab.id} />;
              }
              return null;
            })}

            {/* Save Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}