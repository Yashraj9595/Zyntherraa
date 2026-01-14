import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    variantId: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
}
export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    paymentMethod: string;
    paymentResult?: {
        id: string;
        status: string;
        updateTime: string;
        emailAddress: string;
    };
    refund?: {
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
        processedAt?: Date;
        notes?: Record<string, any>;
    };
    paymentAttempts?: number;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    status?: string;
    trackingNumber?: string;
    trackingHistory?: Array<{
        status: string;
        location?: string;
        timestamp: Date;
        description?: string;
    }>;
    carrier?: string;
    estimatedDelivery?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder> & IOrder & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map