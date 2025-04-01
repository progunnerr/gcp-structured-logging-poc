#!/bin/bash

# Exit on any error
set -e

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Google Cloud SDK (gcloud) is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get the current project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "No project ID found. Please run 'gcloud init' to set up your project."
    exit 1
fi

echo "Using Google Cloud Project: $PROJECT_ID"

# Replace placeholders in configuration files if needed
# Note: We're not replacing anything in cloud-run-config.yaml anymore
# as we're using hardcoded values there

echo "Configuration files updated with project ID: $PROJECT_ID"

# Enable required APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build and push the Docker image
echo "Building and pushing Docker image to Google Container Registry..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/gcp-structured-logging-poc .

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
# Get log level from command line argument or use default
LOG_LEVEL=${1:-debug}
ENABLE_GCP_LOGGING=${2:-true}
echo "Using LOG_LEVEL=$LOG_LEVEL, ENABLE_GCP_LOGGING=$ENABLE_GCP_LOGGING"

gcloud run deploy gcp-structured-logging-poc \
  --image gcr.io/$PROJECT_ID/gcp-structured-logging-poc \
  --platform managed \
  --region us-central1 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars="LOG_LEVEL=$LOG_LEVEL,ENABLE_GCP_LOGGING=$ENABLE_GCP_LOGGING" \
  --allow-unauthenticated

echo "Deployment complete!"
echo "Your application should be available at the URL shown above."
echo "Access the GraphQL playground by adding /graphql to the URL."
