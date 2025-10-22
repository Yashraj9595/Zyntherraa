import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Save } from 'lucide-react';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  supportEmail: string;
  whatsapp: string;
}

export default function ContactUs() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+91 98765 43210',
    email: 'info@zyntherraa.com',
    address: '123 Fashion Street, Mumbai, Maharashtra 400001, India',
    businessHours: 'Monday - Saturday: 10:00 AM - 8:00 PM\nSunday: 11:00 AM - 6:00 PM',
    supportEmail: 'support@zyntherraa.com',
    whatsapp: '+91 98765 43210'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Contact information saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Phone className="inline mr-2" size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Mail className="inline mr-2" size={16} />
              General Email
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Mail className="inline mr-2" size={16} />
              Support Email
            </label>
            <input
              type="email"
              value={contactInfo.supportEmail}
              onChange={(e) => setContactInfo({...contactInfo, supportEmail: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={contactInfo.whatsapp}
              onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="inline mr-2" size={16} />
              Business Address
            </label>
            <textarea
              value={contactInfo.address}
              onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="inline mr-2" size={16} />
              Business Hours
            </label>
            <textarea
              value={contactInfo.businessHours}
              onChange={(e) => setContactInfo({...contactInfo, businessHours: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Contact Info'}
        </button>
      </div>
    </div>
  );
}