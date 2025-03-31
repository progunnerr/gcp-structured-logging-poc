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

# Replace placeholders in configuration files
sed -i '' "s/PROJECT_ID/$PROJECT_ID/g" cloud-run-config.yaml

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
echo "Using LOG_LEVEL=$LOG_LEVEL"

gcloud run deploy gcp-structured-logging-poc \
  --image gcr.io/$PROJECT_ID/gcp-structured-logging-poc \
  --platform managed \
  --region us-central1 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars="LOG_LEVEL=$LOG_LEVEL" \
  --allow-unauthenticated

echo "Deployment complete!"
echo "Your application should be available at the URL shown above."
echo "Access the GraphQL playground by adding /graphql to the URL."
