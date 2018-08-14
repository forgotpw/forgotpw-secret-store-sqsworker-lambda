const config = {
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  STORE_SQS_QUEUE_NAME: process.env.STORE_SQS_QUEUE_NAME,
  LOG_LEVEL: process.env.LOG_LEVEL
}

module.exports = config
