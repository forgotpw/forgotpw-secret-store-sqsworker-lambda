const config = {
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  STORE_SQS_QUEUE_NAME: process.env.STORE_SQS_QUEUE_NAME,
  USERDATA_S3_BUCKET: process.env.USERDATA_S3_BUCKET,
  USERDATA_S3_SSEC_KEY: process.env.USERDATA_S3_SSEC_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
  LOG_LEVEL: process.env.LOG_LEVEL
}

module.exports = config
