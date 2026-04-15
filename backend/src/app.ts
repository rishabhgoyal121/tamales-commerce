import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import cookieParser from 'cookie-parser'
import { parse } from 'yaml'
import fs from 'node:fs'
import path from 'node:path'
import { router } from './routes.js'
import { logger } from './shared/logger/logger.js'
import { errorHandler } from './shared/middleware/error-handler.js'
import { notFoundHandler } from './shared/middleware/not-found.js'
import { requestContext } from './shared/middleware/request-context.js'
import { env } from './shared/config/env.js'

const openApiPath = path.resolve(process.cwd(), 'openapi/openapi.yaml')
const openApiDocument = parse(fs.readFileSync(openApiPath, 'utf8'))

export const app = express()
const isProduction = env.NODE_ENV === 'production'

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/+$/, '')
}

const configuredOrigins = [
  env.FRONTEND_ORIGIN,
  ...(env.FRONTEND_ORIGINS
    ? env.FRONTEND_ORIGINS.split(',').map((value) => value.trim())
    : []),
]
  .filter((value): value is string => Boolean(value))
  .map(normalizeOrigin)

const allowedOrigins = new Set(configuredOrigins)

app.use(helmet())
app.set('trust proxy', 1)
app.use(
  cors({
    origin(origin, callback) {
      if (!isProduction) {
        callback(null, true)
        return
      }

      // Allow non-browser and same-origin requests that send no Origin header.
      if (!origin) {
        callback(null, true)
        return
      }

      const normalizedOrigin = normalizeOrigin(origin)
      if (allowedOrigins.has(normalizedOrigin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())
app.use(requestContext)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use((req, _res, next) => {
  logger.info({ requestId: req.requestId, method: req.method, path: req.path }, 'Incoming request')
  next()
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.use('/api/v1', router)

app.use(notFoundHandler)
app.use(errorHandler)
