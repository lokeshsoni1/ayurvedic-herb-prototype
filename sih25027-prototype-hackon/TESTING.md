# Testing Guide - HerbChain SIH25027 Prototype

**Prototype proudly built by Team Hackon for SIH25027**

## 🎯 90-Second Demo Script for Judges

This document provides a complete step-by-step demonstration script for evaluating the blockchain-based traceability system.

## 📋 Prerequisites

1. Ensure both frontend and backend are running:
   - Frontend: http://localhost:3000  
   - Backend: http://localhost:5000

2. Have sample data ready (available in `sample_data/` folder)

## 🚀 Complete Demo Flow (90 seconds)

### Step 1: Landing Page & Role Selection (15 seconds)
1. **Navigate to Application**
   - Open http://localhost:3000
   - Show project hero with Team Hackon credit
   - Demonstrate role selection cards

2. **Select Farmer Role**
   - Click "Farmer" role card
   - Navigate to farmer dashboard

### Step 2: Farmer Dashboard - Record Collection Event (20 seconds)
1. **Fill Collection Form**
   ```
   Species: Ashwagandha
   Farmer Name: Ram Kumar Sharma
   Moisture: 12.5%
   GPS: Click map to set location (Rajasthan region)
   Notes: Organic harvest from certified farm
   ```

2. **Submit Collection**
   - Click "Submit Collection Event"
   - Note generated Batch ID (e.g., BATCH_ASH_001)
   - Show success message and blockchain transaction log

### Step 3: Lab Dashboard - Quality Testing (20 seconds)
1. **Switch to Lab Role**
   - Use navigation or return to home

2. **Fill Quality Test Form**
   ```
   Batch ID: BATCH_ASH_001 (from previous step)
   Lab Name: Ayurveda Quality Labs Pvt Ltd
   DNA Sequence: ATCGATCGATCGATCGAATTCCGGAATTC...
   Pesticide Level: 0.03 ppm (within limits)
   Heavy Metals: 0.01 ppm (safe)
   ```

3. **Submit Test Results**
   - Show quality validation (all parameters within limits)
   - Display "PASSED" status

### Step 4: Processor Dashboard - QR Generation (15 seconds)
1. **Switch to Processor Role**
   - View available batches
   - Select BATCH_ASH_001

2. **Generate QR Code**
   - Click "Generate QR Code"
   - Show QR code with embedded batch URL
   - Demonstrate QR code download capability

### Step 5: Customer Portal - Verification (15 seconds)
1. **Switch to Customer Role**
   - Enter batch ID: BATCH_ASH_001
   - OR simulate QR scan

2. **Show Complete Provenance**
   - Farmer information with GPS map
   - Lab test results with safety status
   - Processing history
   - Blockchain verification status

### Step 6: Compliance Monitor (5 seconds)
1. **Navigate to Compliance Page**
   - Show regulatory status dashboard
   - Display AYUSH and NMPB compliance badges
   - Quick demo of "Analyze Risks" modal

## 🧪 API Testing Commands

### Using curl commands:

```bash
# 1. Submit Collection Event
curl -X POST http://localhost:5000/api/farmer/upload \
  -H "Content-Type: application/json" \
  -d '{
    "species": "Ashwagandha",
    "gps": {"lat": 26.9124, "lng": 75.7873},
    "timestamp": "2025-01-15T08:30:00Z",
    "moisture": 12.5,
    "farmerName": "Ram Kumar Sharma",
    "farmerId": "FARMER_001"
  }'

# Expected Response:
{
  "success": true,
  "batchID": "BATCH_ASH_001",
  "transactionId": "tx_1645789123456_abc123",
  "message": "Collection event recorded on blockchain"
}

# 2. Submit Lab Test
curl -X POST http://localhost:5000/api/lab/upload \
  -H "Content-Type: application/json" \
  -d '{
    "batchID": "BATCH_ASH_001",
    "dna": "ATCGATCGATCGATCGAATTCCGGAATTCGATCGATCGAATTCCGG",
    "pesticide": 0.03,
    "moisture": 12.5,
    "heavyMetals": 0.01,
    "labName": "Ayurveda Quality Labs Pvt Ltd",
    "labId": "LAB_AQL_001"
  }'

# 3. Generate QR Code
curl -X POST http://localhost:5000/api/processor/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"batchID": "BATCH_ASH_001"}'

# 4. Get Complete Provenance
curl http://localhost:5000/api/customer/batch/BATCH_ASH_001
```

## 📊 Expected Results

### Successful Flow Results:
✅ **Farmer Submission**: Batch ID generated, GPS validated  
✅ **Lab Testing**: Quality parameters within limits, DNA verified  
✅ **QR Generation**: Scannable QR code with batch URL  
✅ **Customer Verification**: Complete provenance chain displayed  
✅ **Compliance Status**: Regulatory badges shown correctly  

### Sample Ledger State After Demo:
```json
{
  "transactions": [
    {
      "id": "tx_collection_001",
      "type": "collection",
      "data": {
        "batchID": "BATCH_ASH_001",
        "species": "Ashwagandha",
        "farmer": "Ram Kumar Sharma"
      }
    },
    {
      "id": "tx_quality_001", 
      "type": "quality_test",
      "data": {
        "batchID": "BATCH_ASH_001",
        "status": "PASSED",
        "lab": "Ayurveda Quality Labs Pvt Ltd"
      }
    }
  ]
}
```

## 🔍 Key Features to Highlight

1. **End-to-End Traceability**: Complete chain from farm to consumer
2. **Blockchain Simulation**: Ready for Hyperledger Fabric integration
3. **Role-Based Access**: Separate portals for each stakeholder
4. **GPS Validation**: Geo-fencing for harvest location verification
5. **QR Code Integration**: Consumer-friendly verification
6. **Compliance Monitoring**: Regulatory status tracking
7. **Professional UI**: Modern, responsive design

## ⚡ Performance Benchmarks

Expected response times:
- Collection Event Submission: < 500ms
- Quality Test Upload: < 300ms  
- QR Code Generation: < 200ms
- Provenance Retrieval: < 100ms
- Page Load Times: < 2 seconds

## 🎉 Demo Completion Checklist

- [ ] All 4 roles demonstrated (Farmer, Lab, Processor, Customer)
- [ ] Complete traceability flow shown
- [ ] QR code generation and verification working
- [ ] Compliance monitor displayed
- [ ] Team credit "Team Hackon" prominently shown
- [ ] Blockchain integration points explained
- [ ] Production deployment readiness discussed

**Total Demo Time: 90 seconds**  
**Prototype proudly built by Team Hackon for SIH25027**

## 🔄 Hyperledger Fabric Integration Notes

When integrating with real Hyperledger Fabric:
1. Replace REST API calls with Fabric Gateway calls
2. Replace ledger.json with Fabric ledger queries
3. Implement chaincode functions in HerbContract.js
4. Add certificate-based identity management
5. Configure Fabric network topology

Search for `TODO: FABRIC` comments in the codebase for exact integration points.