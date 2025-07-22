#!/bin/bash

# Setup Lambda Function Script
# Usage: ./scripts/setup-lambda.sh <lambda-app-name> [aws-region]
#
# This script creates all necessary AWS resources for a new lambda function:
# - S3 bucket for deployment artifacts
# - IAM role with basic Lambda execution permissions
# - Lambda function
#
# Examples:
#   ./scripts/setup-lambda.sh aws-lambda-stripe-webhook
#   ./scripts/setup-lambda.sh aws-lambda-stripe-webhook eu-central-1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required arguments are provided
if [ $# -lt 1 ]; then
    log_error "Usage: $0 <lambda-app-name> [aws-region]"
    echo ""
    echo "Examples:"
    echo "  $0 aws-lambda-stripe-webhook"
    echo "  $0 aws-lambda-stripe-webhook eu-central-1"
    exit 1
fi

LAMBDA_APP_NAME=$1
AWS_REGION=${2:-"eu-central-1"}

# Read configuration from lambda-config.json
if [ ! -f "lambda-config.json" ]; then
    log_error "lambda-config.json not found. Please run this script from the repository root."
    exit 1
fi

log_info "Reading configuration from lambda-config.json..."
FUNCTION_NAME=$(node -p "
    const config = require('./lambda-config.json');
    config.lambdas['$LAMBDA_APP_NAME']?.functionName || ''
")
S3_BUCKET=$(node -p "
    const config = require('./lambda-config.json');
    config.lambdas['$LAMBDA_APP_NAME']?.s3Bucket || config.defaults?.s3Bucket || 'nanogiants'
")
DESCRIPTION=$(node -p "
    const config = require('./lambda-config.json');
    config.lambdas['$LAMBDA_APP_NAME']?.description || 'Lambda function'
")

if [ -z "$FUNCTION_NAME" ]; then
    log_error "No configuration found for lambda '$LAMBDA_APP_NAME' in lambda-config.json"
    exit 1
fi

log_info "Setting up AWS resources for lambda function:"
echo "  App: $LAMBDA_APP_NAME"
echo "  Function: $FUNCTION_NAME"
echo "  S3 Bucket: $S3_BUCKET"
echo "  Region: $AWS_REGION"
echo "  Description: $DESCRIPTION"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    log_error "AWS CLI is not configured or credentials are invalid"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log_info "Using AWS Account: $ACCOUNT_ID"

# 1. Create S3 bucket if it doesn't exist
log_info "Checking S3 bucket: $S3_BUCKET"
if aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
    log_success "S3 bucket '$S3_BUCKET' already exists"
else
    log_info "Creating S3 bucket: $S3_BUCKET"
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$S3_BUCKET"
    else
        aws s3api create-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" --create-bucket-configuration LocationConstraint="$AWS_REGION"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket "$S3_BUCKET" --versioning-configuration Status=Enabled
    
    log_success "S3 bucket '$S3_BUCKET' created successfully"
fi

# 2. Create IAM role for Lambda function
ROLE_NAME="${FUNCTION_NAME}-role"
log_info "Checking IAM role: $ROLE_NAME"

if aws iam get-role --role-name "$ROLE_NAME" > /dev/null 2>&1; then
    log_success "IAM role '$ROLE_NAME' already exists"
else
    log_info "Creating IAM role: $ROLE_NAME"
    
    # Create trust policy
    cat > /tmp/trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --description "IAM role for $FUNCTION_NAME Lambda function"
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    
    # Create and attach DynamoDB policy (for shared services)
    cat > /tmp/dynamodb-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:$AWS_REGION:$ACCOUNT_ID:table/*"
        }
    ]
}
EOF

    aws iam put-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-name "DynamoDBAccess" \
        --policy-document file:///tmp/dynamodb-policy.json
    
    # Clean up temp files
    rm -f /tmp/trust-policy.json /tmp/dynamodb-policy.json
    
    log_success "IAM role '$ROLE_NAME' created successfully"
    
    # Wait for role to be available
    log_info "Waiting for IAM role to be available..."
    sleep 10
fi

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)

# 3. Create Lambda function
log_info "Checking Lambda function: $FUNCTION_NAME"

if aws lambda get-function --function-name "$FUNCTION_NAME" > /dev/null 2>&1; then
    log_success "Lambda function '$FUNCTION_NAME' already exists"
else
    log_info "Creating Lambda function: $FUNCTION_NAME"
    
    # Create a minimal deployment package
    mkdir -p /tmp/lambda-init
    cat > /tmp/lambda-init/index.js << EOF
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Lambda function created successfully! Deploy your code to replace this placeholder.',
            timestamp: new Date().toISOString()
        })
    };
};
EOF
    
    cd /tmp/lambda-init
    zip -r ../lambda-init.zip .
    cd - > /dev/null
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime "nodejs18.x" \
        --role "$ROLE_ARN" \
        --handler "dist/index.handler" \
        --zip-file "fileb:///tmp/lambda-init.zip" \
        --description "$DESCRIPTION" \
        --timeout 120 \
        --memory-size 128 \
        --region "$AWS_REGION"
    
    # Clean up
    rm -rf /tmp/lambda-init /tmp/lambda-init.zip
    
    log_success "Lambda function '$FUNCTION_NAME' created successfully"
fi

# 4. Create Lambda function URL and set permissions
FUNCTION_URL=""
if aws lambda get-function-url-config --function-name "$FUNCTION_NAME" > /dev/null 2>&1; then
    FUNCTION_URL=$(aws lambda get-function-url-config --function-name "$FUNCTION_NAME" --query 'FunctionUrl' --output text)
    log_success "Function URL already exists: $FUNCTION_URL"
else
    log_info "Creating function URL for HTTP access..."
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name "$FUNCTION_NAME" \
        --auth-type "NONE" \
        --cors 'AllowCredentials=false,AllowHeaders=["*"],AllowMethods=["*"],AllowOrigins=["*"],ExposeHeaders=["*"],MaxAge=86400' \
        --query 'FunctionUrl' --output text)
    log_success "Function URL created: $FUNCTION_URL"
fi

# 5. Add Function URL permission for public access
log_info "Setting Function URL permissions..."
if aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE > /dev/null 2>&1; then
    log_success "Function URL permissions configured for public access"
else
    # Permission might already exist, check if it's a duplicate
    if aws lambda get-policy --function-name "$FUNCTION_NAME" | grep -q "FunctionURLAllowPublicAccess" 2>/dev/null; then
        log_success "Function URL permissions already configured"
    else
        log_warning "Failed to set Function URL permissions - you may need to configure manually"
    fi
fi

echo ""
log_success "🎉 AWS setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  ✅ S3 Bucket: $S3_BUCKET"
echo "  ✅ IAM Role: $ROLE_NAME"
echo "  ✅ Lambda Function: $FUNCTION_NAME"
echo "  ✅ Function URL: $FUNCTION_URL"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy your code: npm run lambda:full-deploy:$(echo $LAMBDA_APP_NAME | sed 's/aws-lambda-//')"
echo "  2. Configure environment variables in AWS Console if needed"
echo "  3. Test your function with the provided URL"
echo ""
echo "🔗 AWS Console Links:"
echo "  Lambda: https://$AWS_REGION.console.aws.amazon.com/lambda/home?region=$AWS_REGION#/functions/$FUNCTION_NAME"
echo "  S3: https://s3.console.aws.amazon.com/s3/buckets/$S3_BUCKET"
echo ""
