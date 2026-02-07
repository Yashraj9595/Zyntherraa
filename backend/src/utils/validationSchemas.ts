import Joi from 'joi';

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
const indianPhonePattern = /^[6-9]\d{9}$/; // Indian mobile numbers
const urlPattern = /^https?:\/\/.+/;
const imagePathPattern = /^(https?:\/\/.+|\/?uploads\/.+|\/?images\/.+)/i;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Common validators
export const commonValidators = {
  email: Joi.string().email().pattern(emailPattern).trim().lowercase().max(255),
  phone: Joi.string().pattern(indianPhonePattern).trim().min(10).max(10),
  phoneInternational: Joi.string().pattern(phonePattern).trim().min(10).max(15),
  url: Joi.string().uri().pattern(urlPattern).trim(),
  imagePath: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (!value) {
        return helpers.error('any.required');
      }

      if (imagePathPattern.test(value)) {
        return value;
      }

      return helpers.error('string.uri');
    }, 'image path validation'),
  objectId: Joi.string().pattern(objectIdPattern).required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().trim().min(1).max(100).required(),
  text: Joi.string().trim().min(1).max(10000),
  positiveNumber: Joi.number().positive().min(0),
  positiveInteger: Joi.number().integer().positive().min(1),
  postalCode: Joi.string().trim().min(5).max(10).pattern(/^[0-9]+$/),
  address: Joi.string().trim().min(5).max(500),
  city: Joi.string().trim().min(2).max(100),
  country: Joi.string().trim().min(2).max(100),
  otp: Joi.string().length(6).pattern(/^[0-9]{6}$/),
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    name: commonValidators.name,
    email: commonValidators.email.required(),
    password: commonValidators.password,
    phone: commonValidators.phone.optional(),
  }),

  login: Joi.object({
    email: commonValidators.email.required(),
    password: Joi.string().required(),
  }),

  verifyOTP: Joi.object({
    email: commonValidators.email.required(),
    otp: commonValidators.otp.required(),
  }),

  resendOTP: Joi.object({
    email: commonValidators.email.required(),
    purpose: Joi.string().valid('registration', 'login', 'reset').optional(),
  }),

  verifyLoginOTP: Joi.object({
    email: commonValidators.email.required(),
    otp: commonValidators.otp.required(),
  }),

  forgotPassword: Joi.object({
    email: commonValidators.email.required(),
  }),

  verifyResetOTP: Joi.object({
    email: commonValidators.email.required(),
    otp: commonValidators.otp.required(),
  }),

  resetPassword: Joi.object({
    resetToken: Joi.string().required(),
    newPassword: commonValidators.password,
  }),

  update: Joi.object({
    name: commonValidators.name.optional(),
    email: commonValidators.email.optional(),
    phone: commonValidators.phone.optional(),
    role: Joi.string().valid('user', 'admin').optional(),
  }).min(1), // At least one field required
};

// Product validation schemas
export const productSchemas = {
  create: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().min(10).max(5000).required(),
    category: Joi.string().trim().min(1).max(100).required(),
    subcategory: Joi.string().trim().min(1).max(100).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').default('Active'),
    styleNumber: Joi.string().trim().max(50).optional(),
    fabric: Joi.string().trim().max(100).optional(),
    variants: Joi.array()
      .items(
        Joi.object({
          size: Joi.string().trim().max(20).required(),
          color: Joi.string().trim().max(50).required(),
          price: commonValidators.positiveNumber.required(),
          stock: commonValidators.positiveInteger.required(),
          sku: Joi.string().trim().max(50).optional(),
          images: Joi.array().items(commonValidators.imagePath).min(1).max(10).optional(),
          video: commonValidators.url.optional(),
        })
      )
      .min(1)
      .required(),
  }),

  update: Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    description: Joi.string().trim().min(10).max(5000).optional(),
    category: Joi.string().trim().min(1).max(100).optional(),
    subcategory: Joi.string().trim().min(1).max(100).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').optional(),
    styleNumber: Joi.string().trim().max(50).optional(),
    fabric: Joi.string().trim().max(100).optional(),
    variants: Joi.array()
      .items(
        Joi.object({
          size: Joi.string().trim().max(20).required(),
          color: Joi.string().trim().max(50).required(),
          price: commonValidators.positiveNumber.required(),
          stock: commonValidators.positiveInteger.required(),
          sku: Joi.string().trim().max(50).optional(),
          images: Joi.array().items(commonValidators.imagePath).min(1).max(10).optional(),
          video: commonValidators.url.optional(),
        })
      )
      .min(1)
      .optional(),
  }).min(1), // At least one field required
};

// Category validation schemas
export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
    image: commonValidators.imagePath.optional(),
    slug: Joi.string().trim().min(1).max(100).optional(),
    subcategories: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().min(1).max(100).required(),
          description: Joi.string().trim().max(500).optional(),
          image: commonValidators.imagePath.optional(),
        })
      )
      .optional(),
  }),

  update: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
    image: commonValidators.imagePath.optional(),
    slug: Joi.string().trim().min(1).max(100).optional(),
    subcategories: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().min(1).max(100).required(),
          description: Joi.string().trim().max(500).optional(),
          image: commonValidators.imagePath.optional(),
        })
      )
      .optional(),
  }).min(1),
};

// Order validation schemas
export const orderSchemas = {
  create: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product: commonValidators.objectId,
          variantId: Joi.string().trim().required(),
          quantity: commonValidators.positiveInteger.required(),
          price: commonValidators.positiveNumber.required(),
          size: Joi.string().trim().max(20).optional(),
          color: Joi.string().trim().max(50).optional(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      fullName: commonValidators.name.required(),
      address: commonValidators.address.required(),
      city: commonValidators.city.required(),
      postalCode: commonValidators.postalCode.required(),
      country: commonValidators.country.required(),
      phone: commonValidators.phoneInternational.required(),
    }).required(),
    paymentMethod: Joi.string().valid('Cash on Delivery', 'Razorpay', 'Credit Card').required(),
    itemsPrice: commonValidators.positiveNumber.required(),
    taxPrice: commonValidators.positiveNumber.min(0).required(),
    shippingPrice: commonValidators.positiveNumber.min(0).required(),
    totalPrice: commonValidators.positiveNumber.required(),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Refunded')
      .required(),
  }),

  markAsPaid: Joi.object({
    id: Joi.string().optional(),
    status: Joi.string().optional(),
    updateTime: Joi.string().optional(),
    emailAddress: commonValidators.email.optional(),
  }),
};

// Payment validation schemas
export const paymentSchemas = {
  createOrder: Joi.object({
    amount: commonValidators.positiveNumber.min(1).max(1000000).required(),
    currency: Joi.string().valid('INR', 'USD', 'EUR').default('INR'),
    orderId: commonValidators.objectId,
    paymentMethod: Joi.string().valid('Razorpay', 'Cash on Delivery').optional(),
  }),

  verify: Joi.object({
    razorpay_order_id: Joi.string().trim().required(),
    razorpay_payment_id: Joi.string().trim().required(),
    razorpay_signature: Joi.string().trim().required(),
    orderId: commonValidators.objectId,
  }),

  refund: Joi.object({
    orderId: commonValidators.objectId,
    amount: commonValidators.positiveNumber.min(1).optional(),
    reason: Joi.string().trim().max(500).optional(),
    notes: Joi.object().optional(),
  }),
};

// Query parameter schemas
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  products: Joi.object({
    category: Joi.string().trim().optional(),
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Draft').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

// Parameter schemas
export const paramSchemas = {
  id: Joi.object({
    id: commonValidators.objectId,
  }),

  orderId: Joi.object({
    orderId: commonValidators.objectId,
  }),
};

