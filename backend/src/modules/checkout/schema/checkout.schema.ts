import { z } from 'zod'

export const previewCheckoutSchema = z.object({
  couponCode: z.string().min(1).max(64).optional(),
})

export type PreviewCheckoutInput = z.infer<typeof previewCheckoutSchema>

export const placeOrderSchema = z.object({
  couponCode: z.string().min(1).max(64).optional(),
  paymentOutcome: z.enum(['PENDING', 'AUTHORIZED', 'FAILED']).default('AUTHORIZED'),
  address: z.object({
    fullName: z.string().trim().min(2).max(120),
    line1: z.string().trim().min(3).max(160),
    line2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().min(2).max(80),
  }),
})

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
