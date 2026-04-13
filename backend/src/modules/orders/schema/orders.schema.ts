import { z } from 'zod'

export const orderStatusSchema = z.enum([
  'CREATED',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
])

export const updateAdminOrderStatusSchema = z.object({
  status: orderStatusSchema,
  note: z.string().trim().max(280).optional(),
})

export type UpdateAdminOrderStatusInput = z.infer<typeof updateAdminOrderStatusSchema>
