import { z } from 'zod'

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999),
})

export const couponSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .max(64, 'Coupon code is too long')
    .regex(/^[a-zA-Z0-9_-]*$/, 'Use only letters, numbers, - and _')
    .optional()
    .or(z.literal('')),
})

export type AddCartItemFormValues = z.infer<typeof addCartItemSchema>
export type CouponFormValues = z.infer<typeof couponSchema>
