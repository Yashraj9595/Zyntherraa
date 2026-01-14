import mongoose, { Document } from 'mongoose';
export interface ISubcategory {
    name: string;
    productCount: number;
    status: 'Active' | 'Inactive';
    parentId: mongoose.Types.ObjectId;
}
export interface ICategory extends Document {
    name: string;
    productCount: number;
    status: 'Active' | 'Inactive';
    subcategories: ISubcategory[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory> & ICategory & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Category.d.ts.map