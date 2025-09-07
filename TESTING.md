# Testing Guide - SIH25027 Prototype

**Prototype developed by Team Hackon**

## 🎯 Demo Script for Judges

This document provides a complete step-by-step demonstration script for evaluating the blockchain-based traceability system.

## 📋 Prerequisites

1. Ensure both frontend and backend are running:
   - Frontend: http://localhost:3000  
   - Backend: http://localhost:5000

2. Have sample data ready (available in `sample_data/` folder)

## 🚀 Complete Demo Flow

### Step 1: Farmer Dashboard - Record Collection Event

1. **Navigate to Application**
   - Open http://localhost:3000
   - Click on "Farmer" role

2. **Fill Collection Form**
   ```
   Species: Ashwagandha
   Farmer Name: Ram Kumar Sharma
   Moisture: 12.5
   Notes: Organic harvest from certified farm
   ```

3. **Set GPS Location**
   - Click on map to set GPS coordinates
   - Expected: Jaipur, Rajasthan area (26.9124, 75.7873)
   - System validates geo-fencing automatically

4. **Submit Collection**
   - Click "Submit Collection Event"
   - Expected Response: "Collection event submitted successfully!"
   - Note the generated Batch ID (e.g., BATCH_ASH_001)

5. **Verify Backend Logs**
   ```
   🔗 [BLOCKCHAIN] Transaction submitted: tx_1645789123456_abc123
   📦 [BLOCKCHAIN] Type: collection
   ✅ [SMART CONTRACT] Geo-fence validation passed for Ashwagandha
   🌱 [SMART CONTRACT] Seasonal validation for Ashwagandha: VALID
   ```

6. **Check Recent Submissions**
   - Verify the submitted batch appears in "Recent Submissions" table
   - GPS coordinates should be displayed

### Step 2: Lab Dashboard - Quality Testing

1. **Switch to Lab Role**
   - Click "Lab" in navigation

2. **Select Batch for Testing**
   - Select the previously created batch (BATCH_ASH_001)

3. **Fill Quality Test Form**
   ```
   Lab Name: Ayurveda Quality Labs Pvt Ltd
   Lab ID: LAB_AQL_001
   DNA Sequence: ATCGATCGATCGATCGAATTCCGGAATTC...
   Pesticide Level: 0.03 (ppm)
   Moisture Content: 12.5 (%)
   Heavy Metals: 0.01 (ppm)
   ```

4. **Submit Test Results**
   - Click "Submit Test Results"
   - Expected Response: "Quality test results submitted successfully!"

5. **Verify Quality Standards**
   - Check that all values are within acceptable limits:
     - Pesticide < 0.1 ppm ✅
     - Heavy Metals < 0.05 ppm ✅
     - Moisture 10-15% ✅

6. **Check Recent Tests**
   - Verify test appears with "PASSED" status

### Step 3: Processor Dashboard - Processing & QR Generation

1. **Switch to Processor Role**
   - Click "Processor" in navigation

2. **View Available Batches**
   - Verify BATCH_ASH_001 appears in batches list
   - Status should show "Quality Verified"

3. **Process the Batch**
   - Click processing step buttons in sequence:
     1. "Start Drying" → Status: "Drying"
     2. "Complete Drying" → Status: "Grinding"  
     3. "Complete Grinding" → Status: "Packaging"
     4. "Complete Packaging" → Status: "Ready for QR"

4. **Generate QR Code**
   - Click "Generate QR Code"
   - QR code image should appear
   - Note the encoded batch verification URL

5. **Download QR Code**
   - Right-click QR code to save
   - QR contains: `${API_BASE_URL}/customer/batch/BATCH_ASH_001`

### Step 4: Customer Portal - Product Verification

1. **Switch to Customer Role**  
   - Click "Customer" in navigation

2. **Method A: Manual Batch Entry**
   - Enter batch ID: BATCH_ASH_001
   - Click "Search Batch"

3. **Method B: QR Code Simulation**
   - Click "Try Sample Batch" for demo

4. **Verify Provenance Information**
   Expected display sections:
   
   ```
   ✅ VERIFICATION STATUS: Fully Verified
   
   🚜 FARMER INFORMATION
   Name: Ram Kumar Sharma
   Location: Jaipur, Rajasthan (26.9124, 75.7873)
   Harvest Date: 2025-01-15T08:30:00Z
   
   🧪 QUALITY TEST RESULTS
   Lab: Ayurveda Quality Labs Pvt Ltd
   DNA: Verified ✅
   Pesticide: 0.03 ppm (Safe) ✅
   Heavy Metals: 0.01 ppm (Safe) ✅
   
   🏭 PROCESSING HISTORY
   Processor: Himalaya Wellness Company
   Drying: Completed ✅
   Grinding: Completed ✅
   Packaging: Completed ✅
   
   🗺️ FARM LOCATION MAP
   Interactive map showing exact harvest location
   
   🔗 BLOCKCHAIN VERIFICATION
   Transaction Hash: 0x1a2b3c4d...
   Block Number: #12345
   Verified: ✅
   ```

## 🧪 API Testing

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

# 3. Get Batch Provenance
curl http://localhost:5000/api/customer/batch/BATCH_ASH_001

# Expected Response: Complete provenance bundle with all stages
```

## 📊 Expected Ledger State

After completing all steps, `backend/data/ledger.json` should contain:

```json
{
  "transactions": [
    {
      "id": "tx_1645789123456_abc123",
      "type": "collection",
      "data": {
        "id": "BATCH_ASH_001",
        "species": "Ashwagandha",
        "gps": {"lat": 26.9124, "lng": 75.7873},
        "farmerName": "Ram Kumar Sharma",
        "farmerId": "FARMER_001"
      },
      "timestamp": "2025-01-15T08:30:00Z",
      "hash": "0x1a2b3c4d5e6f7890"
    },
    {
      "id": "tx_1645789234567_def456", 
      "type": "quality_test",
      "data": {
        "batchID": "BATCH_ASH_001",
        "verified": true,
        "labName": "Ayurveda Quality Labs Pvt Ltd"
      }
    },
    {
      "id": "tx_1645789345678_ghi789",
      "type": "processing", 
      "data": {
        "batchID": "BATCH_ASH_001",
        "drying": "completed",
        "grinding": "completed", 
        "packaging": "completed"
      }
    }
  ]
}
```

## ⚡ Performance Benchmarks

Expected response times:
- Collection Event Submission: < 500ms
- Quality Test Upload: < 300ms  
- QR Code Generation: < 200ms
- Provenance Retrieval: < 100ms

## 🔍 Error Scenarios to Test

### 1. Invalid GPS Coordinates
```bash
# Test geo-fencing validation
curl -X POST http://localhost:5000/api/farmer/upload \
  -d '{"species": "Ashwagandha", "gps": {"lat": 0, "lng": 0}}'
  
# Expected: Geo-fence validation error
```

### 2. Seasonal Validation
```bash  
# Test with wrong season (June for Ashwagandha)
curl -X POST http://localhost:5000/api/farmer/upload \
  -d '{"species": "Ashwagandha", "timestamp": "2025-06-15T08:30:00Z"}'
  
# Expected: Seasonal validation warning
```

### 3. Missing Batch ID
```bash
curl http://localhost:5000/api/customer/batch/INVALID_BATCH
# Expected: 404 Not Found
```

## 📱 Mobile Testing

1. Access http://localhost:3000 on mobile device
2. Test responsive design on different screen sizes
3. Verify touch interactions for maps and forms

## 🎯 Success Criteria

✅ **Frontend Functionality**
- All 4 role dashboards load correctly
- Forms submit successfully with validation
- Maps display GPS coordinates
- QR codes generate and display
- Responsive design works on mobile

✅ **Backend API**  
- All endpoints respond with correct JSON
- File uploads work (simulated)
- Blockchain simulation logs transactions
- Data persists in ledger.json

✅ **Integration Testing**
- Complete flow from Farmer → Customer works
- Data consistency across all stages
- QR codes encode correct verification URLs
- Provenance data includes all required fields

✅ **Performance**
- Pages load within 2 seconds
- API responses under 500ms
- No JavaScript console errors
- Proper error handling and user feedback

## 🐛 Known Issues & Limitations

1. **Map Integration**: Uses OpenStreetMap tiles (no API key required)
2. **File Uploads**: Simulated (files not actually stored)  
3. **Real-time Updates**: Manual page refresh required
4. **Authentication**: Not implemented (prototype only)
5. **Blockchain**: Simulated (not real Hyperledger Fabric)

## 📝 Judge Evaluation Checklist

- [ ] System loads and runs without errors
- [ ] All 4 user roles are accessible
- [ ] Complete traceability flow works end-to-end  
- [ ] QR code generation and verification functions
- [ ] GPS validation and mapping works
- [ ] Code is well-documented with clear TODOs
- [ ] Blockchain integration points are identified
- [ ] Professional UI/UX design
- [ ] Team credit is prominently displayed
- [ ] Repository is ready for continued development

## 🎉 Demo Completion

After completing all steps:
1. Show the complete provenance bundle in Customer portal
2. Demonstrate QR code scanning simulation  
3. Review blockchain transaction logs
4. Highlight key technical features
5. Discuss production deployment plans

**Total demo time: 10-15 minutes**  
**Prototype developed by Team Hackon**