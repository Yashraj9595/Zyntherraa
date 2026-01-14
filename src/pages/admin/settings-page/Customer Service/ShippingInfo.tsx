import React, { useState } from 'react';
import { Truck, Save } from 'lucide-react';

interface ShippingPolicy {
  domesticShipping: string;
  internationalShipping: string;
  shippingRates: string;
  deliveryTimes: string;
  trackingInfo: string;
  specialInstructions: string;
}

export default function ShippingInfo() {
  const [shippingInfo, setShippingInfo] = useState<ShippingPolicy>({
    domesticShipping: `Domestic Shipping (Within India):

• Standard Shipping: 3-5 business days
• Express Shipping: 1-2 business days
• Same Day Delivery: Available in Mumbai, Delhi, Bangalore (orders before 2 PM)

Free shipping on orders above ₹999
Standard shipping charges: ₹99
Express shipping charges: ₹199`,
    internationalShipping: `International Shipping:

Currently, we only ship within India. 
We are working on expanding our shipping to international locations.

For international customers, please contact us at international@zyntherraa.com for special arrangements.`,
    shippingRates: `Shipping Rates:

Domestic Shipping:
• Orders below ₹999: ₹99 (Standard), ₹199 (Express)
• Orders ₹999 and above: FREE Standard Shipping
• Express Shipping: ₹199 (regardless of order value)
• Same Day Delivery: ₹299 (select cities only)

Cash on Delivery:
• Available for orders above ₹500
• Additional COD charges: ₹50`,
    deliveryTimes: `Estimated Delivery Times:

Metro Cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad):
• Standard: 2-3 business days
• Express: 1-2 business days
• Same Day: Available (orders before 2 PM)

Tier 2 Cities:
• Standard: 3-4 business days
• Express: 2-3 business days

Remote Areas:
• Standard: 4-7 business days
• Express: 3-5 business days

Note: Delivery times may vary during festivals and peak seasons.`,
    trackingInfo: `Order Tracking:

1. Order Confirmation: You'll receive an email and SMS confirmation immediately after placing your order.

2. Shipping Notification: Once your order is shipped, you'll receive:
   • Tracking number via email and SMS
   • Courier partner details
   • Expected delivery date

3. Track Your Order:
   • Visit our website and enter your order number
   • Use the tracking number on courier partner's website
   • Call our customer service for updates

4. Delivery Updates: You'll receive SMS updates at each stage of delivery.`,
    specialInstructions: `Special Shipping Instructions:

• Fragile items are packed with extra care and bubble wrap
• All orders are quality checked before shipping
• We use tamper-proof packaging for security
• Signature required for deliveries above ₹5000
• If you're not available, courier will attempt delivery 3 times
• Items will be returned to us after failed delivery attempts
• Re-delivery charges may apply for returned packages

For special delivery instructions, please add them in the "Order Notes" section during checkout.`
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Shipping information saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Truck className="inline mr-2" size={16} />
            Domestic Shipping
          </label>
          <textarea
            value={shippingInfo.domesticShipping}
            onChange={(e) => setShippingInfo({...shippingInfo, domesticShipping: e.target.value})}
            rows={8}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Enter domestic shipping information..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            International Shipping
          </label>
          <textarea
            value={shippingInfo.internationalShipping}
            onChange={(e) => setShippingInfo({...shippingInfo, internationalShipping: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Enter international shipping information..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Shipping Rates
          </label>
          <textarea
            value={shippingInfo.shippingRates}
            onChange={(e) => setShippingInfo({...shippingInfo, shippingRates: e.target.value})}
            rows={8}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Enter shipping rates and charges..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Delivery Times
          </label>
          <textarea
            value={shippingInfo.deliveryTimes}
            onChange={(e) => setShippingInfo({...shippingInfo, deliveryTimes: e.target.value})}
            rows={10}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Enter estimated delivery times..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tracking Information
          </label>
          <textarea
            value={shippingInfo.trackingInfo}
            onChange={(e) => setShippingInfo({...shippingInfo, trackingInfo: e.target.value})}
            rows={8}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Enter order tracking information..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Special Instructions
          </label>
          <textarea
            value={shippingInfo.specialInstructions}
            onChange={(e) => setShippingInfo({...shippingInfo, specialInstructions: e.target.value})}
            rows={8}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Enter special shipping instructions..."
          />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Shipping Tips</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Keep shipping information updated and accurate</li>
          <li>• Clearly communicate delivery times to manage customer expectations</li>
          <li>• Consider offering multiple shipping options for customer convenience</li>
          <li>• Update shipping rates regularly based on courier partner changes</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Shipping Info'}
        </button>
      </div>
    </div>
  );
}