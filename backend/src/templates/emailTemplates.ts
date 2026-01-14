// Email Templates for Zyntherraa

export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderDate: Date | string;
  status?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date | string;
  trackingUrl?: string;
}

// Base email template wrapper
const baseTemplate = (content: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zyntherraa</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #000000;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Zyntherraa</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff; max-width: 600px; margin: 0 auto;">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f5f5f5; font-size: 12px; color: #666666;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Zyntherraa. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated email. Please do not reply.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Order Confirmation Email Template
export const orderConfirmationTemplate = (data: OrderEmailData): string => {
  const orderDate = typeof data.orderDate === 'string' ? new Date(data.orderDate) : data.orderDate;
  const formattedDate = orderDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const itemsHtml = data.items.map(item => `
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 15px 0;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${item.productName}</p>
        ${item.size || item.color ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">${[item.size, item.color].filter(Boolean).join(' / ')}</p>` : ''}
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Quantity: ${item.quantity}</p>
      </td>
      <td style="padding: 15px 0; text-align: right; font-weight: 600; color: #1a1a1a;">
        ₹${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const content = `
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Order Confirmation</h2>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${data.customerName},
    </p>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Thank you for your order! We've received your order and will begin processing it right away.
    </p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">Order Details</p>
      <p style="margin: 0; color: #666; font-size: 14px;">Order Number: <strong style="color: #1a1a1a;">${data.orderNumber}</strong></p>
      <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Order Date: ${formattedDate}</p>
      <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Payment Method: ${data.paymentMethod}</p>
    </div>

    <h3 style="color: #1a1a1a; margin: 30px 0 15px 0; font-size: 18px;">Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
    </table>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0; color: #666;">Subtotal:</td>
          <td style="padding: 5px 0; text-align: right; color: #1a1a1a; font-weight: 600;">₹${data.itemsPrice.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #666;">Tax:</td>
          <td style="padding: 5px 0; text-align: right; color: #1a1a1a; font-weight: 600;">₹${data.taxPrice.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #666;">Shipping:</td>
          <td style="padding: 5px 0; text-align: right; color: #1a1a1a; font-weight: 600;">₹${data.shippingPrice.toLocaleString()}</td>
        </tr>
        <tr style="border-top: 2px solid #1a1a1a;">
          <td style="padding: 10px 0 5px 0; color: #1a1a1a; font-weight: 600; font-size: 18px;">Total:</td>
          <td style="padding: 10px 0 5px 0; text-align: right; color: #1a1a1a; font-weight: 600; font-size: 18px;">₹${data.totalPrice.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #1a1a1a; margin: 30px 0 15px 0; font-size: 18px;">Shipping Address</h3>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #333; line-height: 1.8;">
        ${data.shippingAddress.fullName}<br>
        ${data.shippingAddress.address}<br>
        ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
        ${data.shippingAddress.country}<br>
        Phone: ${data.shippingAddress.phone}
      </p>
    </div>

    <p style="color: #333; line-height: 1.6; margin: 20px 0 0 0;">
      We'll send you another email when your order ships. If you have any questions, please contact our support team.
    </p>
  `;

  return baseTemplate(content);
};

// Order Shipped Email Template
export const orderShippedTemplate = (data: OrderEmailData): string => {
  const estimatedDelivery = data.estimatedDelivery 
    ? (typeof data.estimatedDelivery === 'string' ? new Date(data.estimatedDelivery) : data.estimatedDelivery)
    : null;
  const formattedDelivery = estimatedDelivery 
    ? estimatedDelivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '3-5 business days';

  const content = `
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Your Order Has Shipped! 🚚</h2>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${data.customerName},
    </p>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Great news! Your order <strong>${data.orderNumber}</strong> has been shipped and is on its way to you.
    </p>
    
    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">Tracking Information</p>
      ${data.trackingNumber ? `
        <p style="margin: 0; color: #333; font-size: 14px;">Tracking Number: <strong style="color: #1a1a1a;">${data.trackingNumber}</strong></p>
      ` : ''}
      <p style="margin: ${data.trackingNumber ? '5px' : '0'} 0 0 0; color: #333; font-size: 14px;">
        Estimated Delivery: <strong style="color: #1a1a1a;">${formattedDelivery}</strong>
      </p>
    </div>

    <h3 style="color: #1a1a1a; margin: 30px 0 15px 0; font-size: 18px;">Shipping Address</h3>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #333; line-height: 1.8;">
        ${data.shippingAddress.fullName}<br>
        ${data.shippingAddress.address}<br>
        ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
        ${data.shippingAddress.country}<br>
        Phone: ${data.shippingAddress.phone}
      </p>
    </div>

    <p style="color: #333; line-height: 1.6; margin: 20px 0 0 0;">
      You can track your order status anytime. If you have any questions, please contact our support team.
    </p>
  `;

  return baseTemplate(content);
};

// Order Delivered Email Template
export const orderDeliveredTemplate = (data: OrderEmailData): string => {
  const content = `
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Your Order Has Been Delivered! ✅</h2>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${data.customerName},
    </p>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Your order <strong>${data.orderNumber}</strong> has been successfully delivered!
    </p>
    
    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
      <p style="margin: 0; color: #333; line-height: 1.6;">
        We hope you love your purchase! If you have any questions or need assistance, please don't hesitate to contact us.
      </p>
    </div>

    <p style="color: #333; line-height: 1.6; margin: 20px 0 0 0;">
      Thank you for shopping with Zyntherraa!
    </p>
  `;

  return baseTemplate(content);
};

// Order Status Update Email Template
export const orderStatusUpdateTemplate = (data: OrderEmailData): string => {
  const statusMessages: Record<string, string> = {
    'Pending': 'Your order is being processed.',
    'Processing': 'Your order is being prepared for shipment.',
    'Shipped': 'Your order has been shipped and is on its way.',
    'Delivered': 'Your order has been delivered.',
    'Completed': 'Your order has been completed.',
    'Cancelled': 'Your order has been cancelled.',
    'Refunded': 'Your order has been refunded.',
  };

  const statusMessage = statusMessages[data.status || 'Pending'] || 'Your order status has been updated.';

  const content = `
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Order Status Update</h2>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${data.customerName},
    </p>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      We wanted to update you on your order <strong>${data.orderNumber}</strong>.
    </p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">Current Status</p>
      <p style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">${data.status || 'Pending'}</p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">${statusMessage}</p>
    </div>

    <p style="color: #333; line-height: 1.6; margin: 20px 0 0 0;">
      You can track your order status anytime. If you have any questions, please contact our support team.
    </p>
  `;

  return baseTemplate(content);
};

// Password Reset Email Template
export const passwordResetTemplate = (data: { name: string; resetLink: string; expiryHours: number }): string => {
  const content = `
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Reset Your Password</h2>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${data.name || 'User'},
    </p>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      You requested to reset your password. Click the button below to reset it:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetLink}" style="display: inline-block; padding: 15px 30px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600;">
        Reset Password
      </a>
    </div>

    <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.resetLink}" style="color: #1a1a1a; word-break: break-all;">${data.resetLink}</a>
    </p>

    <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
      This link will expire in ${data.expiryHours} hours.
    </p>

    <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    </p>
  `;

  return baseTemplate(content);
};

// Welcome Email Template (after email verification)
export const welcomeEmailTemplate = (data: { name: string }): string => {
  const content = `
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Welcome to Zyntherraa! 🎉</h2>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Dear ${data.name},
    </p>
    <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
      Thank you for verifying your email address! Your account is now active and ready to use.
    </p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #333; line-height: 1.6;">
        You can now enjoy all the features of Zyntherraa, including:
      </p>
      <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #333;">
        <li>Browse our latest fashion collection</li>
        <li>Add items to your wishlist</li>
        <li>Track your orders</li>
        <li>Manage your account</li>
      </ul>
    </div>

    <p style="color: #333; line-height: 1.6; margin: 20px 0 0 0;">
      Start shopping now and discover amazing fashion at Zyntherraa!
    </p>
  `;

  return baseTemplate(content);
};

