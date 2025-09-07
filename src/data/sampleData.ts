/**
 * Sample Data for Ayurvedic Herbs Traceability System Demo
 * Prototype developed by Team Hackon
 * 
 * This file contains sample JSON data structures that demonstrate
 * the complete flow from farm to consumer. In production, this data
 * would be stored on Hyperledger Fabric blockchain.
 */

import { CollectionEvent, QualityTest, ProcessingStep, ProvenanceBundle } from '../types/blockchain';

/**
 * Sample Collection Event - Farmer submits herb collection data
 * This represents the initial blockchain transaction when herbs are harvested
 */
export const sampleCollectionEvent: CollectionEvent = {
  id: "BATCH_ASH_001",
  species: "Ashwagandha",
  gps: { 
    lat: 26.9124, 
    lng: 75.7873,
    altitude: 431 // Jaipur, Rajasthan elevation
  },
  timestamp: "2025-01-15T08:30:00Z",
  moisture: 12.5,
  farmerName: "Ram Kumar Sharma",
  farmerId: "FARMER_001",
  photo: "ashwagandha_harvest.jpg",
  // Blockchain metadata (auto-generated in real system)
  blockHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
  transactionId: "tx_ashwagandha_collection_001"
};

/**
 * Sample Quality Test Results - Lab analysis and verification
 * This shows the structure of laboratory test data recorded on blockchain
 */
export const sampleQualityTest: QualityTest = {
  id: "TEST_001",
  batchID: "BATCH_ASH_001",
  dna: "ATCGATCGATCGATCGAATTCCGGAATTCGATCGATCGAATTCCGG...", // Truncated DNA sequence
  pesticide: 0.03, // ppm - below WHO limit of 0.1 ppm
  moisture: 12.5,
  heavyMetals: 0.01, // ppm - below WHO limit of 0.05 ppm
  labName: "Ayurveda Quality Labs Pvt Ltd",
  labId: "LAB_AQL_001",
  testDate: "2025-01-16T14:00:00Z",
  reportFile: "lab_report_batch_ash_001.pdf",
  verified: true,
  blockHash: "0x2b3c4d5e6f7890abcdef1234567890ab"
};

/**
 * Sample Processing Step - Manufacturer/Processor workflow
 * Tracks the processing stages from raw herb to finished product
 */
export const sampleProcessingStep: ProcessingStep = {
  id: "PROC_001",
  batchID: "BATCH_ASH_001",
  drying: "completed",
  grinding: "completed", 
  packaging: "in-progress",
  processorName: "Himalaya Wellness Company",
  processorId: "PROC_HWC_001",
  processDate: "2025-01-18T10:00:00Z",
  qrCode: "QR_BATCH_ASH_001_FINAL",
  blockHash: "0x3c4d5e6f7890abcdef1234567890abcd"
};

/**
 * Complete Provenance Bundle - End-to-end traceability
 * This is what customers see when they scan QR codes
 */
export const sampleProvenanceBundle: ProvenanceBundle = {
  batchID: "BATCH_ASH_001",
  farmer: sampleCollectionEvent,
  lab: sampleQualityTest,
  processor: sampleProcessingStep,
  qrCode: "QR_VERIFICATION_BATCH_ASH_001",
  isVerified: true,
  lastUpdated: "2025-01-18T15:30:00Z"
};

/**
 * Additional Sample Batches for Demo
 */
export const additionalSampleBatches: CollectionEvent[] = [
  {
    id: "BATCH_BRAHMI_002",
    species: "Brahmi",
    gps: { lat: 11.0168, lng: 76.9558 }, // Coimbatore, Tamil Nadu
    timestamp: "2025-01-20T07:15:00Z",
    moisture: 14.2,
    farmerName: "Lakshmi Devi",
    farmerId: "FARMER_002",
    photo: "brahmi_collection.jpg"
  },
  {
    id: "BATCH_TURMERIC_003", 
    species: "Turmeric",
    gps: { lat: 17.3850, lng: 78.4867 }, // Hyderabad, Telangana
    timestamp: "2025-01-22T09:45:00Z",
    moisture: 11.8,
    farmerName: "Venkata Ramana",
    farmerId: "FARMER_003",
    photo: "turmeric_harvest.jpg"
  }
];

/**
 * Sample Lab Test Results for Additional Batches
 */
export const additionalQualityTests: QualityTest[] = [
  {
    id: "TEST_002",
    batchID: "BATCH_BRAHMI_002",
    dna: "CGAATTCCGATCGATCGAATTCCGGAATTCGATCGATCGAATT...",
    pesticide: 0.02,
    moisture: 14.2,
    heavyMetals: 0.008,
    labName: "South India Botanical Labs",
    labId: "LAB_SIB_002",
    testDate: "2025-01-21T11:30:00Z",
    verified: true
  },
  {
    id: "TEST_003",
    batchID: "BATCH_TURMERIC_003",
    dna: "TAATTCCGATCGATCGAATTCCGGAATTCGATCGATCGAATTC...",
    pesticide: 0.05,
    moisture: 11.8,
    heavyMetals: 0.02,
    labName: "Deccan Herb Testing Lab",
    labId: "LAB_DHT_003", 
    testDate: "2025-01-23T13:15:00Z",
    verified: true
  }
];

/**
 * Instructions for Judges and Developers
 * This comment block explains how to integrate with real Hyperledger Fabric
 */
export const integrationInstructions = `
=== BLOCKCHAIN INTEGRATION INSTRUCTIONS ===

For production deployment with Hyperledger Fabric:

1. CHAINCODE DEVELOPMENT:
   - Replace blockchainService with actual Hyperledger Fabric SDK calls
   - Implement smart contracts (chaincode) for:
     * CollectionEvent validation and storage
     * QualityTest verification and immutable storage  
     * ProcessingStep workflow management
     * ProvenanceBundle aggregation queries

2. NETWORK SETUP:
   - Configure Hyperledger Fabric network with multiple organizations:
     * Farmer Organization (peers for collection events)
     * Lab Organization (peers for quality verification)
     * Processor Organization (peers for processing workflow)
     * Regulator Organization (oversight and compliance)

3. API INTEGRATION:
   - POST /api/farmer/collection -> fabric-network.submitTransaction('createCollection', data)
   - POST /api/lab/quality-test -> fabric-network.submitTransaction('addQualityTest', data)
   - POST /api/processor/processing -> fabric-network.submitTransaction('updateProcessing', data)
   - GET /api/provenance/:batchId -> fabric-network.evaluateTransaction('getProvenance', batchId)

4. IDENTITY MANAGEMENT:
   - Implement Hyperledger Fabric CA for user certificates
   - Replace hardcoded user IDs with actual certificate-based authentication
   - Set up enrollment and registration flows for each organization

5. SMART CONTRACT FEATURES TO ADD:
   - Geo-fencing validation using GPS coordinates
   - Seasonal harvest period validation
   - Multi-signature endorsement policies
   - Automatic compliance checking
   - Integration with IoT sensors for real-time data

6. PRODUCTION CONSIDERATIONS:
   - Set up TLS communication between peers
   - Implement proper backup and disaster recovery
   - Add monitoring and logging infrastructure
   - Configure load balancers for high availability
   - Implement proper access controls and permissions

Current Status: ✅ PROTOTYPE COMPLETE - Ready for Hyperledger Fabric integration
Team: 🏆 Team Hackon - SIH25027 Submission
`;

/**
 * Export all sample data for use in demonstrations
 */
export {
  sampleCollectionEvent as SAMPLE_COLLECTION,
  sampleQualityTest as SAMPLE_QUALITY_TEST,
  sampleProcessingStep as SAMPLE_PROCESSING,
  sampleProvenanceBundle as SAMPLE_PROVENANCE
};