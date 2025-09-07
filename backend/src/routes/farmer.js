/**
 * Farmer Routes for SIH25027 Traceability System
 * Prototype developed by Team Hackon
 * 
 * Routes:
 * - POST /api/farmer/upload - Submit collection event
 * - GET /api/farmer/batches - Get farmer's batches
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG) are allowed'), false);
    }
  }
});

// Validation schema for collection event
const collectionSchema = Joi.object({
  species: Joi.string().required().min(2).max(100),
  gps: Joi.object({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180),
    altitude: Joi.number().optional()
  }).required(),
  timestamp: Joi.string().isoDate().required(),
  moisture: Joi.number().required().min(0).max(100),
  farmerName: Joi.string().required().min(2).max(100),
  farmerId: Joi.string().required().min(3).max(50),
  notes: Joi.string().optional().max(500)
});

/**
 * POST /api/farmer/upload
 * Submit herb collection event to blockchain
 * 
 * Body: CollectionEvent JSON
 * Files: photo (optional)
 * 
 * TODO: In Hyperledger Fabric, this would call:
 * fabric-network.submitTransaction('CreateCollection', collectionEventJSON)
 */
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    logger.info('📝 Farmer collection event submission started');
    
    // Validate input data
    const { error, value } = collectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
    }
    
    // Generate unique batch ID
    const batchID = `BATCH_${value.species.toUpperCase().substring(0, 3)}_${Date.now()}`;
    
    // Create collection event object
    const collectionEvent = {
      id: batchID,
      species: value.species,
      gps: value.gps,
      timestamp: value.timestamp,
      moisture: value.moisture,
      farmerName: value.farmerName,
      farmerId: value.farmerId,
      notes: value.notes || '',
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      
      // Blockchain metadata (auto-generated in real system)
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    // Submit to blockchain simulation
    const txResult = await blockchainService.submitTransaction('collection', collectionEvent);
    
    logger.info(`✅ Collection event submitted: ${batchID}`);
    
    res.status(201).json({
      success: true,
      message: 'Collection event recorded on blockchain',
      batchID: batchID,
      transactionId: txResult.transactionId,
      hash: txResult.hash,
      data: collectionEvent
    });
    
  } catch (error) {
    logger.error('❌ Collection submission failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit collection event',
      message: error.message
    });
  }
});

/**
 * GET /api/farmer/batches
 * Get all batches submitted by farmer
 */
router.get('/batches', async (req, res) => {
  try {
    const { farmerId } = req.query;
    
    if (!farmerId) {
      return res.status(400).json({
        success: false,
        error: 'farmerId query parameter required'
      });
    }
    
    // Get all collection transactions
    const collectionTxs = await blockchainService.getTransactionsByType('collection');
    
    // Filter by farmer ID
    const farmerBatches = collectionTxs
      .filter(tx => tx.data.farmerId === farmerId)
      .map(tx => ({
        ...tx.data,
        transactionHash: tx.hash,
        submittedAt: tx.timestamp
      }));
    
    res.json({
      success: true,
      count: farmerBatches.length,
      batches: farmerBatches
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch farmer batches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batches',
      message: error.message
    });
  }
});

/**
 * GET /api/farmer/batch/:id
 * Get specific batch details
 */
router.get('/batch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const provenance = await blockchainService.getProvenance(id);
    
    if (!provenance || !provenance.farmer) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }
    
    res.json({
      success: true,
      batch: provenance.farmer,
      hasQualityTest: !!provenance.lab,
      hasProcessing: !!provenance.processor,
      isComplete: provenance.isVerified
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch batch details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch details',
      message: error.message
    });
  }
});

module.exports = router;