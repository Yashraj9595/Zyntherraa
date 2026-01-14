import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface ReturnsPolicy {
  returnPeriod: string;
  returnConditions: string;
  exchangePolicy: string;
  refundProcess: string;
  nonReturnableItems: string;
  returnShipping: string;
}

export default function ReturnsExchanges() {
  const [policy, setPolicy] = useState<ReturnsPolicy>({
    returnPeriod: '30 days',
    returnConditions: `Items must be:
• Unworn and in original condition
• With original tags attached
• In original packaging
• Free from any damage, stains, or alterations
• Accompanied by original receipt or order confirmation`,
    exchangePolicy: `Exchanges are available for:
• Different sizes of the same item
• Different colors of the same item (subject to availability)
• Store credit for items of equal or lesser value

Exchange requests must be made within 30 days of purchase.`,
    refundProcess: `Refund Process:
1. Initiate return request through our website or customer service
2. Pack items securely in original packaging
3. Ship items back using provided return label
4. Refund will be processed within 5-7 business days after we receive the items
5. Refunds will be credited to the original payment method`,
    nonReturnableItems: `The following items cannot be returned:
• Intimate apparel and undergarments
• Customized or personalized items
• Items damaged by normal wear and tear
• Items without original tags
• Items purchased with special discounts (clearance/sale items)
• Gift cards and vouchers`,
    returnShipping: `Return Shipping:
• Free return shipping for defective or incorrect items
• Customer responsible for return shipping costs for size/color exchanges
• We recommend using trackable shipping methods
• Items lost in return transit are customer's responsibility`
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Returns & Exchanges policy saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Return Period
          </label>
          <input
            type="text"
            value={policy.returnPeriod}
            onChange={(e) => setPolicy({...policy, returnPeriod: e.target.value})}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., 30 days"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Return Conditions
          </label>
          <textarea
            value={policy.returnConditions}
            onChange={(e) => setPolicy({...policy, returnConditions: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="List the conditions for returns..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Exchange Policy
          </label>
          <textarea
            value={policy.exchangePolicy}
            onChange={(e) => setPolicy({...policy, exchangePolicy: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Describe your exchange policy..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Refund Process
          </label>
          <textarea
            value={policy.refundProcess}
            onChange={(e) => setPolicy({...policy, refundProcess: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Explain the refund process..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Non-Returnable Items
          </label>
          <textarea
            value={policy.nonReturnableItems}
            onChange={(e) => setPolicy({...policy, nonReturnableItems: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="List items that cannot be returned..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Return Shipping Information
          </label>
          <textarea
            value={policy.returnShipping}
            onChange={(e) => setPolicy({...policy, returnShipping: e.target.value})}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Explain return shipping policies..."
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Ensure your return policy complies with local consumer protection laws</li>
          <li>• Clearly communicate return conditions to avoid disputes</li>
          <li>• Consider offering prepaid return labels for better customer experience</li>
          <li>• Update return policy dates when making changes</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Returns Policy'}
        </button>
      </div>
    </div>
  );
}