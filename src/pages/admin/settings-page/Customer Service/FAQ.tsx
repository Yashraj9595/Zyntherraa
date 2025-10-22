import React, { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unworn items with original tags. Items must be in original condition for a full refund.'
    },
    {
      id: '2',
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days within India. Express shipping is available for 1-2 business days delivery.'
    },
    {
      id: '3',
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within India. We are working on expanding our shipping to international locations.'
    },
    {
      id: '4',
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order on our website or the courier partner\'s website.'
    },
    {
      id: '5',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery for orders above ₹500.'
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const addFAQ = () => {
    const newFAQ: FAQItem = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setFaqs([...faqs, newFAQ]);
  };

  const removeFAQ = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('FAQ saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h3>
        <button
          onClick={addFAQ}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-foreground">FAQ #{index + 1}</h4>
              <button
                onClick={() => removeFAQ(faq.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter the question..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Answer
                </label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter the answer..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save FAQ'}
        </button>
      </div>
    </div>
  );
}