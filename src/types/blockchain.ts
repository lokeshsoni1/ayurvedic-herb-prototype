/**
 * Type definitions for Ayurvedic Herbs Blockchain Traceability System
 * Prototype developed by Team Hackon
 * 
 * These types represent the data structures that would be stored 
 * on Hyperledger Fabric blockchain in production.
 */

// GPS coordinates for geo-location tracking
export interface GPSCoordinates {
  lat: number;
  lng: number;
  altitude?: number;
}

// Collection event from farmers - stored as blockchain transaction
export interface CollectionEvent {
  id: string;
  species: string;
  gps: GPSCoordinates;
  timestamp: string;
  moisture: number;
  photo?: string;
  farmerName: string;
  farmerId: string;
  // Blockchain metadata (would be auto-generated in real system)
  blockHash?: string;
  transactionId?: string;
}

// Lab test results - validates herb quality and authenticity
export interface QualityTest {
  id: string;
  batchID: string;
  dna: string;
  pesticide: number;
  moisture: number;
  heavyMetals?: number;
  labName: string;
  labId: string;
  testDate: string;
  reportFile?: string;
  // Blockchain validation
  verified: boolean;
  blockHash?: string;
}

// Processing step by manufacturer/processor
export interface ProcessingStep {
  id: string;
  batchID: string;
  drying: "pending" | "in-progress" | "completed";
  grinding: "pending" | "in-progress" | "completed";
  packaging: "pending" | "in-progress" | "completed";
  processorName: string;
  processorId: string;
  processDate: string;
  qrCode?: string;
  blockHash?: string;
}

// Complete provenance bundle for end consumers
export interface ProvenanceBundle {
  batchID: string;
  farmer: CollectionEvent;
  lab: QualityTest;
  processor: ProcessingStep;
  qrCode: string;
  // Supply chain verification
  isVerified: boolean;
  lastUpdated: string;
}

// User roles in the system
export type UserRole = "farmer" | "lab" | "processor" | "customer" | "regulator";

// Blockchain transaction simulation
export interface BlockchainTransaction {
  id: string;
  type: "collection" | "quality_test" | "processing" | "verification";
  data: CollectionEvent | QualityTest | ProcessingStep;
  timestamp: string;
  hash: string;
  previousHash: string;
  // In real Hyperledger Fabric, this would include:
  // - Channel ID
  // - Chaincode name
  // - Endorsement policies
  // - Peer signatures
}

// Simulation state for prototype
export interface BlockchainState {
  transactions: BlockchainTransaction[];
  blocks: Array<{
    id: string;
    transactions: string[];
    timestamp: string;
    hash: string;
    previousHash: string;
  }>;
}