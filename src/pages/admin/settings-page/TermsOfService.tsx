import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';

export default function TermsOfService() {
  const [termsOfService, setTermsOfService] = useState(`Terms of Service

Last updated: [Date]

1. Acceptance of Terms
By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

2. Use License
Permission is granted to temporarily download one copy of the materials on Zyntherraa's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display
• Attempt to reverse engineer any software contained on the website
• Remove any copyright or other proprietary notations from the materials

3. Products and Services
All products and services are subject to availability. We reserve the right to discontinue any product at any time. Prices for all products are subject to change without notice.

Product Information:
• We strive to display product colors and images as accurately as possible
• Actual colors may vary due to monitor settings and lighting conditions
• Product descriptions are provided for informational purposes
• We reserve the right to correct any errors in product information

4. Pricing and Payment
All prices are listed in Indian Rupees (INR) and are subject to change without notice. Payment must be received in full before products are shipped.

Accepted Payment Methods:
• Credit/Debit Cards (Visa, MasterCard, American Express)
• UPI (Unified Payments Interface)
• Net Banking
• Digital Wallets (Paytm, PhonePe, Google Pay)
• Cash on Delivery (for eligible orders)

5. Shipping and Delivery
Shipping times and return policies are outlined in our shipping policy. We are not responsible for delays caused by shipping carriers or customs (for international orders).

Shipping Terms:
• Orders are processed within 1-2 business days
• Delivery times vary based on location
• Free shipping available on orders above ₹999
• International shipping may be subject to customs duties

6. Returns and Exchanges
Our return policy allows returns within 30 days of purchase. Items must be in original condition with tags attached. Please refer to our detailed return policy for complete terms.

7. User Accounts
When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities under your account.

Account Responsibilities:
• Maintain the security of your login credentials
• Notify us immediately of any unauthorized use
• Provide accurate and up-to-date information
• Use the account only for lawful purposes

8. Prohibited Uses
You may not use our service:
• For any unlawful purpose or to solicit others to perform unlawful acts
• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
• To submit false or misleading information

9. Intellectual Property Rights
The service and its original content, features, and functionality are and will remain the exclusive property of Zyntherraa and its licensors. The service is protected by copyright, trademark, and other laws.

10. Privacy Policy
Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.

11. Limitation of Liability
In no event shall Zyntherraa, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.

12. Disclaimer
The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this company:
• Excludes all representations and warranties relating to this website and its contents
• Excludes all liability for damages arising out of or in connection with your use of this website

13. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.

14. Changes to Terms
We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.

15. Contact Information
For questions about these Terms of Service, contact us at:
Email: legal@zyntherraa.com
Phone: +91 98765 43210
Address: 123 Fashion Street, Mumbai, Maharashtra 400001, India`);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Terms of Service saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-primary" size={24} />
        <h2 className="text-2xl font-semibold text-foreground">Terms of Service</h2>
      </div>

      <div>
        <textarea
          value={termsOfService}
          onChange={(e) => setTermsOfService(e.target.value)}
          rows={30}
          className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="Enter your Terms of Service content..."
        />
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">Terms of Service Guidelines</h3>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Clearly define user rights and responsibilities</li>
          <li>• Include limitation of liability clauses</li>
          <li>• Specify governing law and jurisdiction</li>
          <li>• Update terms date when making changes</li>
          <li>• Ensure compliance with local laws and regulations</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Terms of Service'}
        </button>
      </div>
    </div>
  );
}