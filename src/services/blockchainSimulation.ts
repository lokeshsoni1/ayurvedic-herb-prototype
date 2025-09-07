/**
 * Blockchain Simulation Service
 * Prototype developed by Team Hackon
 * 
 * This simulates Hyperledger Fabric blockchain functionality for demo purposes.
 * In production, this would be replaced with actual chaincode interactions.
 */

import { 
  BlockchainState, 
  BlockchainTransaction, 
  CollectionEvent, 
  QualityTest, 
  ProcessingStep, 
  ProvenanceBundle 
} from '../types/blockchain';

class BlockchainSimulationService {
  private state: BlockchainState;
  
  constructor() {
    // Initialize with sample data for demo
    this.state = {
      transactions: [],
      blocks: []
    };
    this.initializeSampleData();
  }

  /**
   * Simulate submitting a transaction to blockchain
   * In real Hyperledger Fabric, this would:
   * 1. Create transaction proposal
   * 2. Get endorsements from peers
   * 3. Submit to ordering service
   * 4. Commit to ledger
   */
  async submitTransaction(
    type: BlockchainTransaction['type'], 
    data: CollectionEvent | QualityTest | ProcessingStep
  ): Promise<string> {
    const transaction: BlockchainTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      hash: this.generateHash(JSON.stringify(data)),
      previousHash: this.getLastTransactionHash()
    };

    this.state.transactions.push(transaction);
    
    // Simulate blockchain confirmation delay
    console.log(`🔗 [BLOCKCHAIN] Transaction submitted: ${transaction.id}`);
    console.log(`📦 [BLOCKCHAIN] Type: ${type}`);
    console.log(`🔒 [BLOCKCHAIN] Hash: ${transaction.hash}`);
    
    // In real system, this would return actual transaction ID from Hyperledger Fabric
    return transaction.id;
  }

  /**
   * Get complete provenance for a batch ID
   * Simulates querying blockchain ledger
   */
  async getProvenance(batchID: string): Promise<ProvenanceBundle | null> {
    const collectionTx = this.state.transactions.find(tx => 
      tx.type === 'collection' && 
      (tx.data as CollectionEvent).id === batchID
    );
    
    const qualityTx = this.state.transactions.find(tx => 
      tx.type === 'quality_test' && 
      (tx.data as QualityTest).batchID === batchID
    );
    
    const processingTx = this.state.transactions.find(tx => 
      tx.type === 'processing' && 
      (tx.data as ProcessingStep).batchID === batchID
    );

    if (!collectionTx) return null;

    return {
      batchID,
      farmer: collectionTx.data as CollectionEvent,
      lab: qualityTx?.data as QualityTest,
      processor: processingTx?.data as ProcessingStep,
      qrCode: this.generateQRData(batchID),
      isVerified: !!(qualityTx && processingTx),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get all batches for processor dashboard
   */
  getBatches(): CollectionEvent[] {
    return this.state.transactions
      .filter(tx => tx.type === 'collection')
      .map(tx => tx.data as CollectionEvent);
  }

  /**
   * Validate geo-fencing (simulated smart contract logic)
   * In real system, this would be chaincode function
   */
  validateGeoFence(gps: { lat: number; lng: number }, species: string): boolean {
    // Simulated geo-validation for Ashwagandha (Rajasthan region)
    if (species.toLowerCase().includes('ashwagandha')) {
      return gps.lat >= 24.0 && gps.lat <= 30.0 && gps.lng >= 69.0 && gps.lng <= 78.0;
    }
    
    // Default validation - accept all for demo
    console.log(`✅ [SMART CONTRACT] Geo-fence validation passed for ${species}`);
    return true;
  }

  /**
   * Validate seasonal harvest timing
   * Simulates smart contract seasonal validation
   */
  validateSeason(timestamp: string, species: string): boolean {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1; // 1-12
    
    // Ashwagandha harvest season: October to February
    if (species.toLowerCase().includes('ashwagandha')) {
      const isValidSeason = month >= 10 || month <= 2;
      console.log(`🌱 [SMART CONTRACT] Seasonal validation for ${species}: ${isValidSeason ? 'VALID' : 'INVALID'}`);
      return isValidSeason;
    }
    
    return true;
  }

  /**
   * Generate sample data for demo purposes
   */
  private initializeSampleData(): void {
    const sampleCollection: CollectionEvent = {
      id: 'BATCH_ASH_001',
      species: 'Ashwagandha',
      gps: { lat: 26.9124, lng: 75.7873 }, // Jaipur, Rajasthan
      timestamp: '2025-01-15T08:30:00Z',
      moisture: 12.5,
      farmerName: 'Ram Kumar Sharma',
      farmerId: 'FARMER_001',
      photo: 'ashwagandha_harvest.jpg'
    };

    const sampleQuality: QualityTest = {
      id: 'TEST_001',
      batchID: 'BATCH_ASH_001',
      dna: 'ATCGATCGATCGATCG...',
      pesticide: 0.03, // ppm
      moisture: 12.5,
      heavyMetals: 0.01,
      labName: 'Ayurveda Quality Labs Pvt Ltd',
      labId: 'LAB_AQL_001',
      testDate: '2025-01-16T14:00:00Z',
      verified: true
    };

    const sampleProcessing: ProcessingStep = {
      id: 'PROC_001',
      batchID: 'BATCH_ASH_001',
      drying: 'completed',
      grinding: 'completed',
      packaging: 'in-progress',
      processorName: 'Himalaya Wellness Company',
      processorId: 'PROC_HWC_001',
      processDate: '2025-01-18T10:00:00Z'
    };

    // Submit initial transactions
    this.submitTransaction('collection', sampleCollection);
    this.submitTransaction('quality_test', sampleQuality);
    this.submitTransaction('processing', sampleProcessing);
  }

  /**
   * Generate hash (simplified for demo)
   * In real Hyperledger Fabric, uses SHA-256
   */
  private generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private getLastTransactionHash(): string {
    return this.state.transactions.length > 0 
      ? this.state.transactions[this.state.transactions.length - 1].hash 
      : '0x000';
  }

  private generateQRData(batchID: string): string {
    return `HERB_TRACE_${batchID}_${Date.now()}`;
  }
}

// Export singleton instance for use across the app
export const blockchainService = new BlockchainSimulationService();