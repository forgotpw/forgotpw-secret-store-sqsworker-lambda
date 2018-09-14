'use strict';

const AWS = require('aws-sdk')
const config = require('./config')
const logger = require('./logger')
const SecretStoreService = require('./secretStoreService/secretStoreService')

async function handler(event, context, done) {
  // raw console log output easier to copy/paste json from cloudwatch logs
  if (process.env.LOG_LEVEL == 'trace') {
    console.log('Event: ', JSON.stringify(event))
  }

  try {
    let promises = []
    for (let record of event.Records) {
      let snsRecordBody = JSON.parse(record.body)
      promises.push(processMessage(snsRecordBody.Message, record.receiptHandle))
    }
    await Promise.all(promises)
    done()
  }
  catch (err) {
    done(err)
  }
}

async function deleteMessage(receiptHandle) {
  const sqs = new AWS.SQS({region: config.AWS_REGION});
  const awsAccountId = await getAwsAccountId()
  const queueUrl = `https://sqs.${config.AWS_REGION}.amazonaws.com/${awsAccountId}/${config.STORE_SQS_QUEUE_NAME}`
  logger.debug(`Deleting message with receiptHandle ${receiptHandle} for queueUrl: ${queueUrl}`)

  if (receiptHandle === 'MessageReceiptHandle') {
    logger.warn('Skipping delete message, receipt handle indicates local testing')
  } else {
    try {
      await sqs.deleteMessage({
        ReceiptHandle: receiptHandle,
        QueueUrl: queueUrl
      }).promise()
    }
    catch (err) {
      logger.error(`Error deleting message with receiptHandle ${receiptHandle}:`, err)
      throw err
    }
  }
}

async function processMessage(messageBody, receiptHandle) {
  const message = JSON.parse(messageBody)

  if (message.action != 'store') {
    let msg = "Expected message action 'store' but encountered unexpected action: " + message.action
    logger.error(msg)
    throw Error(msg)
  }

  const secretStoreService = new SecretStoreService()
  await secretStoreService.storeSecret(
    message.hint,
    message.application,
    message.normalizedPhone)

  await secretStoreService.sendConfirmationCode(
    message.application,
    message.normalizedPhone
  )
  await deleteMessage(receiptHandle)
}

async function getAwsAccountId() {
  const sts = new AWS.STS();
  const params = {};
  let data = await sts.getCallerIdentity(params).promise()
  return data.Account
}

module.exports.handler = handler
