import mongoose, { Document } from 'mongoose';
export interface IProductVariant {
    size: string;
    color: string;
    images: string[];
    videos: string[];
    price: number;
    stock: number;
    styleNumber?: string;
    fabric?: string;
}
export interface IProduct extends Document {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    variants: IProductVariant[];
    status: 'Active' | 'Inactive';
    styleNumber?: string;
    fabric?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct> & IProduct & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map