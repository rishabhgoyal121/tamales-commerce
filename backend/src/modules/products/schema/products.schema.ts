import { z } from 'zod'

export const createAdminProductSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase and hyphenated'),
  description: z.string().trim().min(8).max(2000),
  priceCents: z.number().int().min(0).max(10_000_000),
  categoryId: z.string().trim().min(1),
  isActive: z.boolean().default(true),
  isNsfw: z.boolean().default(false),
  inventoryQty: z.number().int().min(0).max(1_000_000),
})

export const updateAdminProductSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().min(8).max(2000).optional(),
    priceCents: z.number().int().min(0).max(10_000_000).optional(),
    categoryId: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
    isNsfw: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.priceCents !== undefined ||
      value.categoryId !== undefined ||
      value.isActive !== undefined ||
      value.isNsfw !== undefined,
    { message: 'At least one field is required for update' },
  )

export const updateAdminProductInventorySchema = z.object({
  quantity: z.number().int().min(0).max(1_000_000),
})

export const upsertProductReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(2).max(120).optional(),
  comment: z.string().trim().min(4).max(2000).optional(),
})

export type CreateAdminProductBody = z.infer<typeof createAdminProductSchema>
export type UpdateAdminProductBody = z.infer<typeof updateAdminProductSchema>
export type UpdateAdminProductInventoryBody = z.infer<typeof updateAdminProductInventorySchema>
export type UpsertProductReviewBody = z.infer<typeof upsertProductReviewSchema>
