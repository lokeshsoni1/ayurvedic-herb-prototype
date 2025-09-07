/**
 * Blockchain Simulation Service for SIH25027
 * Prototype developed by Team Hackon
 * 
 * This service simulates Hyperledger Fabric blockchain functionality.
 * In production, replace with actual Fabric SDK calls.
 * 
 * Key simulation features:
 * - Transaction creation and validation
 * - Ledger storage in JSON format
 * - Smart contract logic (geo-fencing, seasonal validation)
 * - Provenance tracking and retrieval
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.ledgerPath = process.env.LEDGER_FILE_PATH || './data/ledger.json';
    this.ledger = {
      transactions: [],
      blocks: [],
      metadata: {
        chainId: 'sih25027-traceability',
        networkName: 'ayurveda-trace-network',
        created: new Date().toISOString(),
        team: 'Team Hackon'
      }
    };
  }

  /**
   * Initialize blockchain simulation
   * Creates ledger file if it doesn't exist
   */
  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.ledgerPath);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Load existing ledger or create new one
      try {
        const data = await fs.readFile(this.ledgerPath, 'utf8');
        this.ledger = JSON.parse(data);
        logger.info(`📖 Blockchain ledger loaded: ${this.ledger.transactions.length} transactions`);
      } catch (error) {
        // Create new ledger with genesis block
        await this.createGenesisBlock();
        await this.saveLedger();
        logger.info('🎯 New blockchain ledger created with genesis block');
      }
      
      logger.info('✅ Blockchain service initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Submit a new transaction to the blockchain
   * TODO: Replace with Hyperledger Fabric submitTransaction()
   */
  async submitTransaction(type, data, endorsements = []) {
    try {
      // Generate transaction ID
      const txId = this.generateTransactionId();
      
      // Create transaction object
      const transaction = {
        id: txId,
        type: type, // 'collection', 'quality_test', 'processing', 'verification'
        data: data,
        timestamp: new Date().toISOString(),
        hash: this.calculateHash(JSON.stringify(data) + txId),
        previousHash: this.getLastTransactionHash(),
        endorsements: endorsements, // TODO: Add peer endorsements in Fabric
        
        // Fabric-specific fields (for future implementation)
        // channelId: 'mychannel',
        // chaincodeName: 'traceability',
        // functionName: this.mapTypeToChaincode(type),
        // args: [JSON.stringify(data)]
      };
      
      // Validate transaction based on type
      const validation = await this.validateTransaction(transaction);
      if (!validation.valid) {
        throw new Error(`Transaction validation failed: ${validation.reason}`);
      }
      
      // Add to ledger
      this.ledger.transactions.push(transaction);
      await this.saveLedger();
      
      // Log transaction (simulating blockchain confirmation)
      console.log(`🔗 [BLOCKCHAIN] Transaction submitted: ${txId}`);
      console.log(`📦 [BLOCKCHAIN] Type: ${type}`);
      console.log(`🔒 [BLOCKCHAIN] Hash: ${transaction.hash}`);
      console.log(`✅ [BLOCKCHAIN] Status: COMMITTED`);
      
      return {
        transactionId: txId,
        status: 'COMMITTED',
        hash: transaction.hash,
        timestamp: transaction.timestamp
      };
      
    } catch (error) {
      logger.error('❌ Transaction submission failed:', error);
      throw error;
    }
  }

  /**
   * Validate transaction using smart contract logic
   * TODO: Implement as Hyperledger Fabric chaincode
   */
  async validateTransaction(transaction) {
    const { type, data } = transaction;
    
    try {
      switch (type) {
        case 'collection':
          return this.validateCollectionEvent(data);
          
        case 'quality_test':
          return this.validateQualityTest(data);
          
        case 'processing':
          return this.validateProcessingStep(data);
          
        default:
          return { valid: true };
      }
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Smart Contract: Validate collection event
   * Implements geo-fencing and seasonal validation
   */
  validateCollectionEvent(data) {
    const { species, gps, timestamp } = data;
    
    // Geo-fencing validation for Ashwagandha (Rajasthan region)
    if (species.toLowerCase().includes('ashwagandha')) {
      const isValidLocation = gps.lat >= 24.0 && gps.lat <= 30.0 && 
                             gps.lng >= 69.0 && gps.lng <= 78.0;
      if (!isValidLocation) {
        console.log(`❌ [SMART CONTRACT] Geo-fence validation FAILED for ${species}`);
        return { 
          valid: false, 
          reason: 'GPS coordinates outside valid cultivation region for Ashwagandha' 
        };
      }
      console.log(`✅ [SMART CONTRACT] Geo-fence validation passed for ${species}`);
    }
    
    // Seasonal validation
    const harvestDate = new Date(timestamp);
    const month = harvestDate.getMonth() + 1; // 1-12
    
    if (species.toLowerCase().includes('ashwagandha')) {
      // Ashwagandha harvest season: October to February
      const isValidSeason = month >= 10 || month <= 2;
      if (!isValidSeason) {
        console.log(`⚠️ [SMART CONTRACT] Seasonal validation WARNING for ${species}: harvested in month ${month}`);
        // Allow but warn (for demo purposes)
      } else {
        console.log(`🌱 [SMART CONTRACT] Seasonal validation passed for ${species}`);
      }
    }
    
    return { valid: true };
  }

  /**
   * Smart Contract: Validate quality test results
   */
  validateQualityTest(data) {
    const { pesticide, heavyMetals, moisture } = data;
    
    // WHO/FDA limits validation
    if (pesticide > 0.1) { // ppm
      return { valid: false, reason: 'Pesticide level exceeds WHO limit (0.1 ppm)' };
    }
    
    if (heavyMetals && heavyMetals > 0.05) { // ppm
      return { valid: false, reason: 'Heavy metals level exceeds WHO limit (0.05 ppm)' };
    }
    
    if (moisture < 8 || moisture > 20) { // percentage
      return { valid: false, reason: 'Moisture content outside acceptable range (8-20%)' };
    }
    
    console.log(`🧪 [SMART CONTRACT] Quality test validation passed`);
    return { valid: true };
  }

  /**
   * Smart Contract: Validate processing step
   */
  validateProcessingStep(data) {
    const { batchID } = data;
    
    // Check if batch has quality verification
    const qualityTest = this.ledger.transactions.find(tx => 
      tx.type === 'quality_test' && tx.data.batchID === batchID
    );
    
    if (!qualityTest) {
      return { 
        valid: false, 
        reason: 'Cannot process batch without quality verification' 
      };
    }
    
    console.log(`🏭 [SMART CONTRACT] Processing validation passed for batch ${batchID}`);
    return { valid: true };
  }

  /**
   * Query: Get complete provenance for a batch
   * TODO: Replace with Fabric evaluateTransaction('GetProvenance', batchID)
   */
  async getProvenance(batchID) {
    try {
      const transactions = this.ledger.transactions.filter(tx => {
        if (tx.type === 'collection') {
          return tx.data.id === batchID;
        }
        return tx.data.batchID === batchID;
      });
      
      if (transactions.length === 0) {
        return null;
      }
      
      // Build provenance bundle
      const collectionTx = transactions.find(tx => tx.type === 'collection');
      const qualityTx = transactions.find(tx => tx.type === 'quality_test');
      const processingTx = transactions.find(tx => tx.type === 'processing');
      
      const provenance = {
        batchID: batchID,
        farmer: collectionTx ? collectionTx.data : null,
        lab: qualityTx ? qualityTx.data : null,
        processor: processingTx ? processingTx.data : null,
        qrCode: this.generateQRData(batchID),
        isVerified: !!(qualityTx && processingTx),
        lastUpdated: new Date().toISOString(),
        blockchainHash: collectionTx ? collectionTx.hash : null,
        transactionCount: transactions.length
      };
      
      console.log(`🔍 [BLOCKCHAIN] Provenance query for batch ${batchID}: ${transactions.length} transactions found`);
      return provenance;
      
    } catch (error) {
      logger.error('❌ Provenance query failed:', error);
      throw error;
    }
  }

  /**
   * Query: Get all batches (for processor dashboard)
   */
  async getAllBatches() {
    const collectionTxs = this.ledger.transactions.filter(tx => tx.type === 'collection');
    return collectionTxs.map(tx => tx.data);
  }

  /**
   * Query: Get transactions by type
   */
  async getTransactionsByType(type) {
    return this.ledger.transactions.filter(tx => tx.type === type);
  }

  /**
   * Utility: Generate transaction ID
   */
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `tx_${timestamp}_${random}`;
  }

  /**
   * Utility: Calculate SHA-256 hash
   */
  calculateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Utility: Get last transaction hash for chaining
   */
  getLastTransactionHash() {
    if (this.ledger.transactions.length === 0) {
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    return this.ledger.transactions[this.ledger.transactions.length - 1].hash;
  }

  /**
   * Utility: Generate QR code data
   */
  generateQRData(batchID) {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/api/customer/batch/${batchID}`;
  }

  /**
   * Create genesis block for new ledger
   */
  async createGenesisBlock() {
    const genesisTransaction = {
      id: 'tx_genesis_000',
      type: 'genesis',
      data: {
        message: 'SIH25027 Traceability Chain Genesis Block',
        team: 'Team Hackon',
        created: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      hash: this.calculateHash('genesis_block_sih25027'),
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };
    
    this.ledger.transactions.push(genesisTransaction);
  }

  /**
   * Save ledger to file system
   */
  async saveLedger() {
    try {
      await fs.writeFile(this.ledgerPath, JSON.stringify(this.ledger, null, 2), 'utf8');
    } catch (error) {
      logger.error('Failed to save ledger:', error);
      throw error;
    }
  }

  /**
   * Get ledger statistics
   */
  getStats() {
    const stats = {
      totalTransactions: this.ledger.transactions.length,
      collectionEvents: this.ledger.transactions.filter(tx => tx.type === 'collection').length,
      qualityTests: this.ledger.transactions.filter(tx => tx.type === 'quality_test').length,
      processingSteps: this.ledger.transactions.filter(tx => tx.type === 'processing').length,
      lastTransaction: this.ledger.transactions.length > 0 ? 
        this.ledger.transactions[this.ledger.transactions.length - 1].timestamp : null
    };
    
    return stats;
  }

  /**
   * Map transaction types to chaincode functions (for future Fabric integration)
   */
  mapTypeToChaincode(type) {
    const mapping = {
      'collection': 'CreateCollection',
      'quality_test': 'AddQualityTest',
      'processing': 'UpdateProcessing',
      'verification': 'VerifyProvenance'
    };
    
    return mapping[type] || 'UnknownFunction';
  }
}

// Export singleton instance
module.exports = new BlockchainService();