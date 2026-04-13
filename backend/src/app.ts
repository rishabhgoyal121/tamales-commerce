import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { parse } from 'yaml'
import fs from 'node:fs'
import path from 'node:path'
import { router } from './routes.js'
import { logger } from './shared/logger/logger.js'
import { errorHandler } from './shared/middleware/error-handler.js'
import { notFoundHandler } from './shared/middleware/not-found.js'

const openApiPath = path.resolve(process.cwd(), 'openapi/openapi.yaml')
const openApiDocument = parse(fs.readFileSync(openApiPath, 'utf8'))

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request')
  next()
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.use('/api/v1', router)

app.use(notFoundHandler)
app.use(errorHandler)
