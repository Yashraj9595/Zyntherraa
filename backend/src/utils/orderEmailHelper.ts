import Order, { IOrder } from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { OrderEmailData } from '../templates/emailTemplates';

// Helper function to format order data for email
export async function formatOrderForEmail(order: IOrder): Promise<OrderEmailData | null> {
  try {
    // Populate user if not already populated
    let user: any;
    if (typeof order.user === 'object' && order.user !== null) {
      user = order.user;
    } else {
      user = await User.findById(order.user).select('name email');
    }

    if (!user) {
      console.error('User not found for order:', order._id);
      return null;
    }

    // Populate product information for items
    const populatedItems = await Promise.all(
      order.items.map(async (item: any) => {
        let product: any;
        if (typeof item.product === 'object' && item.product !== null) {
          product = item.product;
        } else {
          product = await Product.findById(item.product).select('title');
        }

        return {
          productName: product?.title || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        };
      })
    );

    const orderNumber = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackingUrl = order.trackingNumber 
      ? `${frontendUrl}/track-order/${order.trackingNumber}`
      : undefined;

    return {
      orderId: order._id.toString(),
      orderNumber,
      customerName: user.name || order.shippingAddress?.fullName || 'Customer',
      customerEmail: user.email || order.paymentResult?.emailAddress || '',
      items: populatedItems,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      itemsPrice: order.itemsPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      totalPrice: order.totalPrice,
      orderDate: order.createdAt,
      status: order.status || 'Pending',
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      trackingUrl,
    };
  } catch (error) {
    console.error('Error formatting order for email:', error);
    return null;
  }
}

