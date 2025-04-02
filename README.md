# NestJS GCP Structured Logging POC
## Description

A proof-of-concept implementation showcasing structured logging from NestJS to Google Cloud Platform using Winston. This solution provides correlatedIds, structured logs GraphQL APIs with minimal configuration.

## 🌟 Features

• Structured Logging: JSON-formatted logs that are easily searchable and parsable                                                                                                                                                                                                                                                                                                                                           
• Correlation IDs: Track requests across your application with unique identifiers

## 🔧 Installation

```bash
$ npm install
```

### Notable packages

```bash
# Main dependency for structured logging and creating guids for correlationIDs
npm install winston @google-cloud/logging-winston uuid
```

## Environment Variables

The logging behavior can be customized with the following environment variables:

• NODE_ENV: Set to production for GCP-optimized logging                                                                                                                                                                                                                                                                                                                                                                     
• ENABLE_GCP_LOGGING: Set to true to enable Google Cloud Logging integration                                                                                                                                                                                                                                                                                                                                                
• LOG_LEVEL: Set the logging level (debug, info, warn, error)                                                                                                                                                                                                                                                                                                                                                               
• PORT: The port on which the application will run (default: 3000)   

##  Architecture
Logging Module

The core of the logging system is the LoggingModule, which provides:

• LoggingService: A NestJS-compatible logger that wraps Winston                                                                                                                                                                                                                                                                                                                                                             
• CorrelationIdService: Manages request correlation IDs using AsyncLocalStorage                                                                                                                                                                                                                                                                                                                                             
• GraphQLLoggingPlugin: Automatically logs GraphQL operations            

### Key Components   
#### LoggingService

Provides structured logging with correlation ID support:  

```typescript
// String logging                                                                                                                                                                                                                                                                                                                                                                                                            
logger.log('User authenticated', 'AuthService');                                                                                                                                                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                                                                                                                                                                                             
// Object logging (fully structured)                                                                                                                                                                                                                                                                                                                                                                                         
logger.log({                                                                                                                                                                                                                                                                                                                                                                                                                 
  action: 'user_login',                                                                                                                                                                                                                                                                                                                                                                                                      
  userId: '123',                                                                                                                                                                                                                                                                                                                                                                                                             
  timestamp: new Date()                                                                                                                                                                                                                                                                                                                                                                                                      
}, 'AuthService');                                                                                                                                                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                                                                                                                                                                             
// With metadata                                                                                                                                                                                                                                                                                                                                                                                                             
logger.log('User action', 'AuthService', {                                                                                                                                                                                                                                                                                                                                                                                   
  userId: '123',                                                                                                                                                                                                                                                                                                                                                                                                             
  action: 'login'                                                                                                                                                                                                                                                                                                                                                                                                            
});           
```
#### CorrelationIdService
Manages correlation IDs across asynchronous contexts:
```typescript
// Get the current correlation ID                                                                                                                                                                                                                                                                                                                                                                                            
const correlationId = correlationIdService.getCurrentCorrelationId();                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                             
// Set a correlation ID                                                                                                                                                                                                                                                                                                                                                                                                      
correlationIdService.setCorrelationId('abc-123');                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                               
```

#### GraphQLLoggingPlugin

Automatically logs GraphQL operations with timing information and propagates correlation IDs.  

## Deployment

The project includes configuration for deploying to Google Cloud Run:

#### Deploy to Cloud Run
./deploy.sh                                                                                                                                                                                                                                                                                                                                                                                                                  
