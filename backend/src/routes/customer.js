/**
 * Customer Routes for SIH25027 Traceability System
 * Prototype developed by Team Hackon
 * 
 * Routes:
 * - GET /api/customer/batch/:id - Get complete provenance for batch
 * - POST /api/customer/verify - Verify QR code
 * - GET /api/customer/search - Search batches by criteria
 */

const express = require('express');
const Joi = require('joi');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const verifyQRSchema = Joi.object({
  qrData: Joi.string().required().uri(),
  customerLocation: Joi.object({
    lat: Joi.number().optional(),
    lng: Joi.number().optional()
  }).optional()
});

const searchSchema = Joi.object({
  species: Joi.string().optional(),
  farmerName: Joi.string().optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  verified: Joi.boolean().optional(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0)
});

/**
 * GET /api/customer/batch/:id
 * Get complete provenance bundle for a batch
 * 
 * This is the main endpoint customers use to verify product authenticity
 * 
 * TODO: In Hyperledger Fabric, this would call:
 * fabric-network.evaluateTransaction('GetProvenance', batchID)
 */
router.get('/batch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔍 Customer provenance query for batch: ${id}`);
    
    // Get complete provenance from blockchain
    const provenance = await blockchainService.getProvenance(id);
    
    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
        message: `No provenance data found for batch ${id}`
      });
    }
    
    // Calculate verification score
    const verificationScore = calculateVerificationScore(provenance);
    
    // Prepare customer-friendly response
    const customerProvenance = {
      batchID: id,
      
      // Verification Status
      verification: {
        score: verificationScore.score,
        status: verificationScore.status,
        points: verificationScore.points
      },
      
      // Farm Origin
      farm: provenance.farmer ? {
        farmerName: provenance.farmer.farmerName,
        location: {
          coordinates: provenance.farmer.gps,
          region: getRegionName(provenance.farmer.gps)
        },
        harvestDate: provenance.farmer.timestamp,
        species: provenance.farmer.species,
        moisture: provenance.farmer.moisture,
        photo: provenance.farmer.photo
      } : null,
      
      // Quality Assurance
      quality: provenance.lab ? {
        labName: provenance.lab.labName,
        testDate: provenance.lab.testDate,
        dnaVerified: !!provenance.lab.dna,
        pesticideLevel: {
          value: provenance.lab.pesticide,
          unit: 'ppm',
          status: provenance.lab.pesticide <= 0.1 ? 'Safe' : 'Warning',
          limit: 0.1
        },
        heavyMetals: {
          value: provenance.lab.heavyMetals || 0,
          unit: 'ppm',
          status: (provenance.lab.heavyMetals || 0) <= 0.05 ? 'Safe' : 'Warning',
          limit: 0.05
        },
        moisture: {
          value: provenance.lab.moisture,
          unit: '%',
          status: provenance.lab.moisture >= 8 && provenance.lab.moisture <= 20 ? 'Optimal' : 'Acceptable'
        },
        verified: provenance.lab.verified,
        reportFile: provenance.lab.reportFile
      } : null,
      
      // Processing History
      processing: provenance.processor ? {
        processorName: provenance.processor.processorName,
        processDate: provenance.processor.processDate,
        steps: {
          drying: {
            status: provenance.processor.drying,
            completed: provenance.processor.drying === 'completed'
          },
          grinding: {
            status: provenance.processor.grinding,
            completed: provenance.processor.grinding === 'completed'
          },
          packaging: {
            status: provenance.processor.packaging,
            completed: provenance.processor.packaging === 'completed'
          }
        },
        qrCode: provenance.processor.qrCode,
        history: provenance.processor.history || []
      } : null,
      
      // Blockchain Verification
      blockchain: {
        transactionCount: provenance.transactionCount || 0,
        hash: provenance.blockchainHash,
        lastUpdated: provenance.lastUpdated,
        network: 'Hyperledger Fabric Simulation',
        chainId: 'sih25027-traceability'
      },
      
      // Additional Metadata
      metadata: {
        queryTimestamp: new Date().toISOString(),
        qrVerificationUrl: provenance.qrCode,
        isComplete: provenance.isVerified,
        team: 'Prototype developed by Team Hackon'
      }
    };
    
    // Log successful query
    logger.info(`✅ Provenance data retrieved for batch ${id}: ${verificationScore.status}`);
    
    res.json({
      success: true,
      provenance: customerProvenance
    });
    
  } catch (error) {
    logger.error('❌ Customer provenance query failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provenance data',
      message: error.message
    });
  }
});

/**
 * POST /api/customer/verify
 * Verify QR code and return provenance
 * 
 * Body: { qrData, customerLocation? }
 */
router.post('/verify', async (req, res) => {
  try {
    logger.info('📱 QR code verification started');
    
    // Validate input
    const { error, value } = verifyQRSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
    }
    
    const { qrData, customerLocation } = value;
    
    // Extract batch ID from QR URL
    const urlMatch = qrData.match(/\/batch\/([A-Z0-9_]+)$/);
    if (!urlMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code format',
        message: 'QR code does not contain valid batch verification URL'
      });
    }
    
    const batchID = urlMatch[1];
    
    // Get provenance data
    const provenance = await blockchainService.getProvenance(batchID);
    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Invalid QR code',
        message: 'Batch not found in blockchain ledger'
      });
    }
    
    // Log verification attempt
    logger.info(`📱 QR verification successful for batch: ${batchID}`);
    if (customerLocation) {
      logger.info(`📍 Customer location: ${customerLocation.lat}, ${customerLocation.lng}`);
    }
    
    // Return verification result
    res.json({
      success: true,
      message: 'QR code verified successfully',
      batchID: batchID,
      verified: true,
      redirectUrl: `/api/customer/batch/${batchID}`
    });
    
  } catch (error) {
    logger.error('❌ QR verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'QR verification failed',
      message: error.message
    });
  }
});

/**
 * GET /api/customer/search
 * Search batches by various criteria
 */
router.get('/search', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.details[0].message
      });
    }
    
    const { species, farmerName, dateFrom, dateTo, verified, limit, offset } = value;
    
    // Get all batches
    const allBatches = await blockchainService.getAllBatches();
    
    // Apply filters
    let filteredBatches = allBatches.filter(batch => {
      // Species filter
      if (species && !batch.species.toLowerCase().includes(species.toLowerCase())) {
        return false;
      }
      
      // Farmer name filter
      if (farmerName && !batch.farmerName.toLowerCase().includes(farmerName.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      const batchDate = new Date(batch.timestamp);
      if (dateFrom && batchDate < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && batchDate > new Date(dateTo)) {
        return false;
      }
      
      return true;
    });
    
    // If verified filter is specified, check verification status
    if (typeof verified === 'boolean') {
      const batchVerificationPromises = filteredBatches.map(async (batch) => {
        const provenance = await blockchainService.getProvenance(batch.id);
        return {
          ...batch,
          isVerified: provenance.isVerified
        };
      });
      
      const batchesWithVerification = await Promise.all(batchVerificationPromises);
      filteredBatches = batchesWithVerification.filter(batch => batch.isVerified === verified);
    }
    
    // Sort by date (newest first)
    filteredBatches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const totalCount = filteredBatches.length;
    const paginatedBatches = filteredBatches.slice(offset, offset + limit);
    
    res.json({
      success: true,
      results: {
        batches: paginatedBatches,
        pagination: {
          total: totalCount,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < totalCount
        }
      }
    });
    
  } catch (error) {
    logger.error('❌ Search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * GET /api/customer/stats
 * Get public statistics about the traceability system
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = blockchainService.getStats();
    
    res.json({
      success: true,
      statistics: {
        ...stats,
        system: {
          name: 'SIH25027 - Blockchain-based Traceability of Ayurvedic Herbs',
          team: 'Team Hackon',
          version: '1.0.0',
          network: 'Hyperledger Fabric Simulation'
        }
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * Utility: Calculate verification score based on available data
 */
function calculateVerificationScore(provenance) {
  let score = 0;
  const points = [];
  
  // Farm origin verification (25 points)
  if (provenance.farmer) {
    score += 25;
    points.push('Farm origin verified');
  }
  
  // Quality test verification (35 points)
  if (provenance.lab?.verified) {
    score += 35;
    points.push('Quality tests passed');
  }
  
  // Processing completion (25 points)
  if (provenance.processor?.drying === 'completed' &&
      provenance.processor?.grinding === 'completed' &&
      provenance.processor?.packaging === 'completed') {
    score += 25;
    points.push('Processing completed');
  }
  
  // QR code generation (15 points)
  if (provenance.processor?.qrCode) {
    score += 15;
    points.push('QR verification enabled');
  }
  
  // Determine status
  let status;
  if (score >= 90) status = 'Fully Verified';
  else if (score >= 70) status = 'Well Verified';
  else if (score >= 50) status = 'Partially Verified';
  else if (score >= 25) status = 'Basic Verification';
  else status = 'Unverified';
  
  return { score, status, points };
}

/**
 * Utility: Get region name from GPS coordinates
 */
function getRegionName(gps) {
  // Simple region mapping for Indian states (expand as needed)
  const { lat, lng } = gps;
  
  // Rajasthan (Ashwagandha region)
  if (lat >= 24.0 && lat <= 30.0 && lng >= 69.0 && lng <= 78.0) {
    return 'Rajasthan, India';
  }
  
  // Tamil Nadu
  if (lat >= 8.0 && lat <= 13.5 && lng >= 76.0 && lng <= 80.5) {
    return 'Tamil Nadu, India';
  }
  
  // Karnataka
  if (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) {
    return 'Karnataka, India';
  }
  
  // Default to India
  if (lat >= 6.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0) {
    return 'India';
  }
  
  return 'Unknown Region';
}

module.exports = router;