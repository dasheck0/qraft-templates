#!/bin/bash

# Deploy Lambda Function Script
# Usage: ./scripts/deploy-lambda.sh <lambda-app-name> [function-name] [s3-bucket] [s3-prefix]
#
# If function-name is not provided, it will try to read from lambda-config.json
#
# Examples:
#   ./scripts/deploy-lambda.sh aws-lambda-translate
#   ./scripts/deploy-lambda.sh aws-lambda-translate nanogiants-miro-board-translator
#   ./scripts/deploy-lambda.sh aws-lambda-translate nanogiants-miro-board-translator nanogiants lambda/custom-path

set -e

# Check if required arguments are provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <lambda-app-name> [function-name] [s3-bucket] [s3-prefix]"
    echo ""
    echo "Examples:"
    echo "  $0 aws-lambda-translate"
    echo "  $0 aws-lambda-translate nanogiants-miro-board-translator"
    echo "  $0 aws-lambda-translate nanogiants-miro-board-translator nanogiants lambda/custom-path"
    exit 1
fi

LAMBDA_APP_NAME=$1

# Try to read configuration from lambda-config.json if function name not provided
if [ $# -eq 1 ] && [ -f "lambda-config.json" ]; then
    echo "Reading configuration from lambda-config.json..."
    FUNCTION_NAME=$(node -p "
        const config = require('./lambda-config.json');
        config.lambdas['$LAMBDA_APP_NAME']?.functionName || ''
    ")
    S3_BUCKET=$(node -p "
        const config = require('./lambda-config.json');
        config.lambdas['$LAMBDA_APP_NAME']?.s3Bucket || config.defaults?.s3Bucket || 'nanogiants'
    ")
    S3_PREFIX=$(node -p "
        const config = require('./lambda-config.json');
        config.lambdas['$LAMBDA_APP_NAME']?.s3Prefix || config.defaults?.s3Prefix || 'lambda'
    ")

    if [ -z "$FUNCTION_NAME" ]; then
        echo "Error: No configuration found for lambda '$LAMBDA_APP_NAME' in lambda-config.json"
        exit 1
    fi
else
    FUNCTION_NAME=${2:-""}
    S3_BUCKET=${3:-"nanogiants"}
    S3_PREFIX=${4:-"lambda"}

    if [ -z "$FUNCTION_NAME" ]; then
        echo "Error: Function name is required when not using configuration file"
        exit 1
    fi
fi

# Get the app directory
APP_DIR="apps/$LAMBDA_APP_NAME"

if [ ! -d "$APP_DIR" ]; then
    echo "Error: Lambda app directory '$APP_DIR' does not exist"
    exit 1
fi

echo "Deploying lambda function..."
echo "  App: $LAMBDA_APP_NAME"
echo "  Function: $FUNCTION_NAME"
echo "  S3 Bucket: $S3_BUCKET"
echo "  S3 Prefix: $S3_PREFIX"
echo ""

# Change to app directory
cd "$APP_DIR"

# Get package version
PACKAGE_VERSION=$(node -p "require('./package.json').version")
BUILD_FILE="build-$PACKAGE_VERSION.zip"
S3_KEY="$S3_PREFIX/$BUILD_FILE"

echo "Building and packaging..."
npm run clean
npm run pack

echo "Uploading to S3..."
aws s3 cp "$BUILD_FILE" "s3://$S3_BUCKET/$S3_KEY"

echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --s3-bucket "$S3_BUCKET" \
    --s3-key "$S3_KEY"

echo "Deployment completed successfully!"
echo "  Build file: $BUILD_FILE"
echo "  S3 location: s3://$S3_BUCKET/$S3_KEY"
