import { z } from 'zod'

export const previewCheckoutSchema = z.object({
  couponCode: z.string().min(1).max(64).optional(),
})

export type PreviewCheckoutInput = z.infer<typeof previewCheckoutSchema>
