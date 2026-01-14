import React, { useState } from 'react';
import { Cookie, Save } from 'lucide-react';

export default function CookiePolicy() {
  const [cookiePolicy, setCookiePolicy] = useState(`Cookie Policy

Last updated: [Date]

1. What Are Cookies
Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to website owners.

Types of Cookies:
• Session Cookies: Temporary cookies that expire when you close your browser
• Persistent Cookies: Remain on your device until they expire or are deleted
• First-Party Cookies: Set by our website directly
• Third-Party Cookies: Set by external services we use

2. How We Use Cookies
We use cookies to:
• Remember your preferences and settings
• Analyze website traffic and usage patterns
• Provide personalized content and advertisements
• Improve website functionality and user experience
• Ensure website security and prevent fraud
• Enable social media features
• Provide customer support chat functionality

3. Types of Cookies We Use

Essential Cookies:
These cookies are necessary for the website to function properly and cannot be disabled.
• Authentication cookies (keep you logged in)
• Security cookies (prevent fraud and abuse)
• Shopping cart cookies (remember items in your cart)
• Load balancing cookies (distribute traffic efficiently)

Analytics Cookies:
Help us understand how visitors use our website to improve user experience.
• Google Analytics (website traffic analysis)
• Hotjar (user behavior analysis)
• Internal analytics (custom tracking)

Marketing Cookies:
Used to deliver relevant advertisements and track marketing campaign effectiveness.
• Google Ads (advertising and remarketing)
• Facebook Pixel (social media advertising)
• Email marketing cookies (track email campaign performance)

Functional Cookies:
Enhance website functionality and personalization.
• Language preference cookies
• Currency selection cookies
• Theme/display preference cookies
• Location-based cookies

4. Third-Party Cookies
We may allow third-party companies to place cookies on your device to provide services such as:

Google Services:
• Google Analytics for website analytics
• Google Ads for advertising
• Google Maps for location services

Social Media:
• Facebook for social login and sharing
• Instagram for social media integration
• WhatsApp for customer support

Payment Processors:
• Razorpay for payment processing
• PayPal for payment processing
• Stripe for payment processing

5. Managing Cookies
You have several options for managing cookies:

Browser Settings:
Most web browsers allow you to:
• View cookies stored on your device
• Delete existing cookies
• Block cookies from specific websites
• Block all cookies (may affect website functionality)

Opt-Out Tools:
• Google Analytics Opt-out: https://tools.google.com/dlpage/gaoptout
• Facebook Opt-out: https://www.facebook.com/settings?tab=ads
• Industry opt-out tools: http://www.aboutads.info/choices/

Cookie Preferences:
You can manage your cookie preferences through our cookie consent banner or by contacting us directly.

6. Cookie Consent
When you first visit our website, we will ask for your consent to use non-essential cookies. You can:
• Accept all cookies
• Reject non-essential cookies
• Customize your cookie preferences
• Change your preferences at any time

7. Impact of Disabling Cookies
If you disable cookies, some features of our website may not function properly:
• You may need to re-enter information repeatedly
• Personalized content may not be available
• Shopping cart functionality may be limited
• Website performance may be affected

8. Updates to Cookie Policy
We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of any material changes by posting the updated policy on our website.

9. International Data Transfers
Some of our third-party service providers may transfer your data to countries outside your region. We ensure appropriate safeguards are in place for such transfers.

10. Children's Privacy
Our website is not intended for children under 13. We do not knowingly collect personal information from children through cookies.

11. Contact Us
If you have any questions about our use of cookies or this Cookie Policy, please contact us at:

Email: cookies@zyntherraa.com
Phone: +91 98765 43210
Address: 123 Fashion Street, Mumbai, Maharashtra 400001, India

You can also contact us to:
• Request information about cookies we use
• Opt-out of specific cookie categories
• Report cookie-related issues
• Update your cookie preferences`);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Cookie Policy saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Cookie className="text-primary" size={24} />
        <h2 className="text-2xl font-semibold text-foreground">Cookie Policy</h2>
      </div>

      <div>
        <textarea
          value={cookiePolicy}
          onChange={(e) => setCookiePolicy(e.target.value)}
          rows={30}
          className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="Enter your Cookie Policy content..."
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Cookie Policy Guidelines</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Clearly explain what cookies are and how they're used</li>
          <li>• Provide easy ways for users to manage cookie preferences</li>
          <li>• List all third-party services that use cookies</li>
          <li>• Ensure compliance with GDPR and other privacy regulations</li>
          <li>• Update the policy when adding new cookie-using services</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Cookie Policy'}
        </button>
      </div>
    </div>
  );
}