# API Routes

This folder contains Express.js route handlers for the HerbChain API.

**Prototype proudly built by Team Hackon for SIH25027**

## Routes to Generate:
- [ ] farmer.js - POST /upload, GET /batches
- [ ] lab.js - POST /upload, GET /tests  
- [ ] processor.js - GET /batches, POST /generate-qr
- [ ] customer.js - GET /batch/:id, POST /verify
- [ ] compliance.js - GET /summary, POST /update

## Integration Points:
Each route file should include:
1. TODO comments for Hyperledger Fabric integration
2. Blockchain simulation calls
3. Input validation with Joi
4. Error handling
5. Logging with Winston
6. File upload handling (where applicable)

## Fabric Integration Notes:
- Replace file operations with Fabric ledger calls
- Add certificate-based authentication
- Implement chaincode function calls
- Add transaction endorsement logic