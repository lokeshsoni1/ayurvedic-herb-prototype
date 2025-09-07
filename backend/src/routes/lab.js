/**
 * Lab Routes for SIH25027 Traceability System
 * Prototype developed by Team Hackon
 * 
 * Routes:
 * - POST /api/lab/upload - Submit quality test results
 * - GET /api/lab/tests - Get lab test history
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for test report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.env.UPLOAD_DIR || './uploads', 'reports'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `report_${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and CSV files are allowed for test reports'), false);
    }
  }
});

// Validation schema for quality test
const qualityTestSchema = Joi.object({
  batchID: Joi.string().required().pattern(/^BATCH_[A-Z0-9_]+$/),
  dna: Joi.string().required().min(10).max(1000),
  pesticide: Joi.number().required().min(0).max(10), // ppm
  moisture: Joi.number().required().min(0).max(100), // percentage
  heavyMetals: Joi.number().optional().min(0).max(1), // ppm
  labName: Joi.string().required().min(5).max(200),
  labId: Joi.string().required().min(3).max(50),
  testDate: Joi.string().isoDate().optional(),
  notes: Joi.string().optional().max(500)
});

/**
 * POST /api/lab/upload
 * Submit quality test results to blockchain
 * 
 * Body: QualityTest JSON
 * Files: report (optional PDF/CSV)
 * 
 * TODO: In Hyperledger Fabric, this would call:
 * fabric-network.submitTransaction('AddQualityTest', qualityTestJSON)
 */
router.post('/upload', upload.single('report'), async (req, res) => {
  try {
    logger.info('🧪 Lab quality test submission started');
    
    // Validate input data
    const { error, value } = qualityTestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
    }
    
    // Check if batch exists
    const provenance = await blockchainService.getProvenance(value.batchID);
    if (!provenance || !provenance.farmer) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
        message: `No collection event found for batch ${value.batchID}`
      });
    }
    
    // Generate unique test ID
    const testID = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Determine test status based on quality standards
    const testStatus = determineTestStatus(value);
    
    // Create quality test object
    const qualityTest = {
      id: testID,
      batchID: value.batchID,
      dna: value.dna,
      pesticide: value.pesticide,
      moisture: value.moisture,
      heavyMetals: value.heavyMetals || 0,
      labName: value.labName,
      labId: value.labId,
      testDate: value.testDate || new Date().toISOString(),
      notes: value.notes || '',
      reportFile: req.file ? `/uploads/reports/${req.file.filename}` : null,
      
      // Test results
      verified: testStatus.passed,
      status: testStatus.status,
      warnings: testStatus.warnings,
      
      // Blockchain metadata
      submittedAt: new Date().toISOString()
    };
    
    // Submit to blockchain simulation
    const txResult = await blockchainService.submitTransaction('quality_test', qualityTest);
    
    logger.info(`✅ Quality test submitted: ${testID} for batch ${value.batchID}`);
    
    res.status(201).json({
      success: true,
      message: 'Quality test results recorded on blockchain',
      testID: testID,
      transactionId: txResult.transactionId,
      hash: txResult.hash,
      status: testStatus.status,
      passed: testStatus.passed,
      data: qualityTest
    });
    
  } catch (error) {
    logger.error('❌ Quality test submission failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quality test',
      message: error.message
    });
  }
});

/**
 * GET /api/lab/tests
 * Get all quality tests submitted by lab
 */
router.get('/tests', async (req, res) => {
  try {
    const { labId } = req.query;
    
    if (!labId) {
      return res.status(400).json({
        success: false,
        error: 'labId query parameter required'
      });
    }
    
    // Get all quality test transactions
    const qualityTxs = await blockchainService.getTransactionsByType('quality_test');
    
    // Filter by lab ID
    const labTests = qualityTxs
      .filter(tx => tx.data.labId === labId)
      .map(tx => ({
        ...tx.data,
        transactionHash: tx.hash,
        submittedAt: tx.timestamp
      }))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)); // Most recent first
    
    res.json({
      success: true,
      count: labTests.length,
      tests: labTests
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch lab tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tests',
      message: error.message
    });
  }
});

/**
 * GET /api/lab/batches-available
 * Get batches available for quality testing (collection events without tests)
 */
router.get('/batches-available', async (req, res) => {
  try {
    // Get all collection events
    const collectionTxs = await blockchainService.getTransactionsByType('collection');
    const qualityTxs = await blockchainService.getTransactionsByType('quality_test');
    
    // Find batches without quality tests
    const testedBatchIds = new Set(qualityTxs.map(tx => tx.data.batchID));
    const availableBatches = collectionTxs
      .filter(tx => !testedBatchIds.has(tx.data.id))
      .map(tx => ({
        ...tx.data,
        submittedAt: tx.timestamp,
        transactionHash: tx.hash
      }))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({
      success: true,
      count: availableBatches.length,
      batches: availableBatches
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch available batches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available batches',
      message: error.message
    });
  }
});

/**
 * Determine test status based on quality standards
 * Implements quality validation logic
 */
function determineTestStatus(testData) {
  const { pesticide, heavyMetals, moisture } = testData;
  const warnings = [];
  let passed = true;
  
  // WHO/FDA Quality Standards
  const standards = {
    pesticide: { max: 0.1, unit: 'ppm' },      // WHO limit
    heavyMetals: { max: 0.05, unit: 'ppm' },   // WHO limit
    moisture: { min: 8, max: 20, unit: '%' }   // Ayurvedic standards
  };
  
  // Check pesticide levels
  if (pesticide > standards.pesticide.max) {
    warnings.push(`Pesticide level (${pesticide} ppm) exceeds WHO limit (${standards.pesticide.max} ppm)`);
    passed = false;
  }
  
  // Check heavy metals
  if (heavyMetals > standards.heavyMetals.max) {
    warnings.push(`Heavy metals level (${heavyMetals} ppm) exceeds WHO limit (${standards.heavyMetals.max} ppm)`);
    passed = false;
  }
  
  // Check moisture content
  if (moisture < standards.moisture.min || moisture > standards.moisture.max) {
    warnings.push(`Moisture content (${moisture}%) outside acceptable range (${standards.moisture.min}-${standards.moisture.max}%)`);
    if (moisture < 5 || moisture > 25) {
      passed = false; // Fail if extremely out of range
    }
  }
  
  // Determine overall status
  let status;
  if (passed && warnings.length === 0) {
    status = 'PASSED';
  } else if (passed && warnings.length > 0) {
    status = 'PASSED_WITH_WARNINGS';
  } else {
    status = 'FAILED';
  }
  
  return { passed, status, warnings };
}

module.exports = router;