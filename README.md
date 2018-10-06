# Secret Store SQS Worker Lambda

Process events to store secrets.  When requests are submitted from the REST API to store secrets such as password hints, an SNS event is fired.  An SQS queue created in this project subscribes to these events and this worker processes these SQS messages.  Secrets are stored in an encrypted S3 bucket.

## Setup

Install the Serverless CLI.

```shell
# install the serverless framework
npm install serverless -g
```

## Deploy

```shell
# needed to enable proper use of aws profiles with serverless framework
export AWS_SDK_LOAD_CONFIG=1
export AWS_ENV="dev" && export PROFILE="fpw$AWS_ENV"

sls \
    deploy \
    --aws-profile $PROFILE \
    --verbose
```

## Invoke Locally

```shell
# ensure we are matching the version of node used by lambda
nvm use 8.10.0
# needed to enable proper use of aws profiles with serverless framework
export AWS_SDK_LOAD_CONFIG=1
export AWS_ENV="dev" && export PROFILE="fpw$AWS_ENV"

sls invoke local \
    -f fpw-secret-store-sqsworker \
    -p ./events/ValidStoreSQSRequest.json \
    -l
```

# License

GNU General Public License v3.0

See [LICENSE](LICENSE.txt) to see the full text.
