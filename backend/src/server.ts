import { app } from './app.js'
import { env } from './shared/config/env.js'
import { logger } from './shared/logger/logger.js'

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Backend server started')
})
