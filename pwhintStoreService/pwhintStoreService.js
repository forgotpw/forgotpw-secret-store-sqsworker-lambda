const AWS = require('aws-sdk');
const logger = require('../logger')

class PwhintStoreService {
  constructor() {}

  async StorePwhint(hint, application, normalizedPhone) {
    logger.info(`Storing hint for ${normalizedPhone}, application: ${application}, hint:(${hint.length} chars)`)
    return Promise.resolve()
  }
}

module.exports = PwhintStoreService
