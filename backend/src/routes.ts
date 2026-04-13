import { Router } from 'express'
import { getHealthApiController } from './modules/health/api/health-api.controller.js'
import { listProductsApiController } from './modules/products/api/products-api.controller.js'

export const router = Router()

router.get('/health', getHealthApiController)
router.get('/products', listProductsApiController)
