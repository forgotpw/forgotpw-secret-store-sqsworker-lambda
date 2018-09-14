const AWS = require('aws-sdk')
const config = require('../config')
const mustache = require('mustache');
const logger = require('../logger')
const TwilioSmsPlus = require('twilio-sms-plus')

class SecretStoreService {
  constructor() {}

  async storeSecret(hint, application, normalizedPhone) {
    logger.info(`Storing hint for ${normalizedPhone}, application: ${application}, hint:(${hint.length} chars)`)

    // Note: all data validation and massaging should have been done in the
    // REST API ahead of time so no need to reproduce that here

    let s3key = `users/${normalizedPhone}/data/${application}.json`

    let data = {
      hint: hint
    }
    let body = JSON.stringify(data)

    logger.debug(`Updating ${body.length} chars to s3://${config.USERDATA_S3_BUCKET}/${s3key}`)

    try {
      const s3 = new AWS.S3()
      let resp = await s3.putObject({
        Bucket: config.USERDATA_S3_BUCKET,
        Key: s3key,
        ServerSideEncryption: 'AES256',
        Body: body,
        ContentType: 'application/json'
      }).promise()
  
      logger.trace(`S3 PutObject response for s3://${config.USERDATA_S3_BUCKET}/${s3key}:`, resp)
    }
    catch (err) {
      logger.error(`Error updating s3://${config.USERDATA_S3_BUCKET}/${s3key}:`, err)
      throw err
    }

    logger.info(`Successfully updated ${body.length} chars to s3://${config.USERDATA_S3_BUCKET}/${s3key}`)
  }

  async sendConfirmationCode(application, normalizedPhone) {
    let confirmationCode = await generateCode(normalizedPhone)
    await textConfirmationCode(application, confirmationCode, normalizedPhone)
  }

}

async function generateCode(normalizedPhone) {
  // generate random number
  let confirmationCode = Math.floor(1000 + Math.random() * 9000)

  // set a TTL to expire the record from dynamo for 1 hour later
  const currentEpoch = (new Date).getTime()
  let expireEpoch = currentEpoch + 1000 * 60 * 60

  // write to dynamodb table
  const AWS = require("aws-sdk")
  const docClient = new AWS.DynamoDB.DocumentClient()

  const params = {
      TableName:'fpw_confirmation_code',
      Item:{
          "NormalizedPhone": normalizedPhone,
          "Code": confirmationCode,
          "DynamoExpireTime": expireEpoch
      }
  };

  logger.debug(`Storing confirmation code ${confirmationCode} to Dynamodb for ${normalizedPhone}...`)
  try {
    await docClient.put(params).promise()
  }
  catch (err) {
    logger.error("Unable to write confirmation code to Dynamodb: ", JSON.stringify(err, null, 2))
  }
  logger.debug(`Wrote confirmation code ${confirmationCode} to Dynamodb for ${normalizedPhone}`)
  return confirmationCode
}

async function textConfirmationCode(application, confirmationCode, normalizedPhone) {
  const viewData = {
    application,
    confirmationCode
  }
  let template = 'Your confirmation code for {{application}} is {{confirmationCode}}.'
  let textMessage = mustache.render(template, viewData)

  const twilioPlus = new TwilioSmsPlus({
    twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
  })
  const result = await twilioPlus.sendTextMessage({
    textMessage: textMessage,
    toPhoneNumber: normalizedPhone,
    fromPhoneNumber: config.TWILIO_FROM_NUMBER,
    logS3bucket: config.USERDATA_S3_BUCKET,
    logS3keyPrefix: `users/${normalizedPhone}/transcript`
  })

}

module.exports = SecretStoreService
