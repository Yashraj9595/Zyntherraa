import React, { useState } from 'react';
import { Shield, Save } from 'lucide-react';

export default function PrivacyPolicy() {
  const [privacyPolicy, setPrivacyPolicy] = useState(`Privacy Policy

Last updated: [Date]

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.

Personal Information:
• Name and contact information (email address, phone number, mailing address)
• Payment information (credit card details, billing address)
• Account credentials (username, password)
• Demographic information (age, gender, preferences)

Automatically Collected Information:
• Device information (IP address, browser type, operating system)
• Usage data (pages visited, time spent, click patterns)
• Cookies and similar tracking technologies

2. How We Use Your Information
We use the information we collect to:
• Process and fulfill your orders
• Provide customer service and support
• Send you important updates about your orders
• Improve our website and services
• Personalize your shopping experience
• Send marketing communications (with your consent)
• Prevent fraud and ensure security

3. Information Sharing and Disclosure
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:

Service Providers:
• Payment processors for transaction processing
• Shipping companies for order delivery
• Email service providers for communications
• Analytics providers for website improvement

Legal Requirements:
• When required by law or legal process
• To protect our rights and property
• To prevent fraud or illegal activities

4. Data Security
We implement appropriate security measures to protect your personal information:
• SSL encryption for data transmission
• Secure servers and databases
• Regular security audits and updates
• Limited access to personal information
• Employee training on data protection

5. Your Rights and Choices
You have the right to:
• Access your personal information
• Update or correct your information
• Delete your account and data
• Opt-out of marketing communications
• Request data portability
• File complaints with data protection authorities

6. Cookies and Tracking
We use cookies and similar technologies to:
• Remember your preferences and settings
• Analyze website traffic and usage
• Provide personalized content
• Improve website functionality

You can control cookies through your browser settings.

7. Third-Party Links
Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.

8. Children's Privacy
Our services are not intended for children under 13. We do not knowingly collect personal information from children.

9. International Data Transfers
Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.

10. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website.

11. Contact Us
If you have any questions about this Privacy Policy, please contact us at:
Email: privacy@zyntherraa.com
Phone: +91 98765 43210
Address: 123 Fashion Street, Mumbai, Maharashtra 400001, India`);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Privacy Policy saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-primary" size={24} />
        <h2 className="text-2xl font-semibold text-foreground">Privacy Policy</h2>
      </div>

      <div>
        <textarea
          value={privacyPolicy}
          onChange={(e) => setPrivacyPolicy(e.target.value)}
          rows={30}
          className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="Enter your Privacy Policy content..."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Privacy Policy Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure compliance with applicable privacy laws (GDPR, CCPA, etc.)</li>
          <li>• Be transparent about data collection and usage</li>
          <li>• Provide clear opt-out mechanisms</li>
          <li>• Update the policy date when making changes</li>
          <li>• Consider consulting with a legal professional</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Privacy Policy'}
        </button>
      </div>
    </div>
  );
}