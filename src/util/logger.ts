import { Console } from 'console'
import { validateLogger } from './validations'

/**
 * @summary Creates a logger instance
 * @example
 *    const log = createLogger(instance)
 *    log.info('Hello world!')
 */
export const createLogger = (customLogger?) => {
  if (logger) {
    return logger
  } else if (!validateLogger(customLogger) && !customLogger) {
    logger = new Console({stdout: process.stdout, stderr: process.stderr, colorMode: true})
    logger.info('Standard logger created')
  } else {
    logger = customLogger
    logger.info('Customized logger registered successfully!')
  }

  return logger
}

export let logger
