/**
 * Processor Routes for SIH25027 Traceability System
 * Prototype developed by Team Hackon
 * 
 * Routes:
 * - GET /api/processor/batches - Get all batches for processing
 * - POST /api/processor/update-status - Update processing status
 * - POST /api/processor/generate-qr - Generate QR code for batch
 */

const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const updateStatusSchema = Joi.object({
  batchID: Joi.string().required().pattern(/^BATCH_[A-Z0-9_]+$/),
  step: Joi.string().required().valid('drying', 'grinding', 'packaging'),
  status: Joi.string().required().valid('in-progress', 'completed'),
  processorId: Joi.string().required(),
  processorName: Joi.string().required(),
  notes: Joi.string().optional().max(500)
});

const generateQRSchema = Joi.object({
  batchID: Joi.string().required().pattern(/^BATCH_[A-Z0-9_]+$/),
  processorId: Joi.string().required()
});

/**
 * GET /api/processor/batches
 * Get all batches with their processing status
 * 
 * Returns batches with collection, quality test, and processing information
 */
router.get('/batches', async (req, res) => {
  try {
    logger.info('📋 Fetching processor batches');
    
    // Get all batches from blockchain
    const allBatches = await blockchainService.getAllBatches();
    
    // Enrich with quality test and processing data
    const enrichedBatches = await Promise.all(
      allBatches.map(async (batch) => {
        const provenance = await blockchainService.getProvenance(batch.id);
        
        return {
          ...batch,
          qualityTest: provenance.lab || null,
          processing: provenance.processor || null,
          isQualityVerified: !!provenance.lab?.verified,
          isProcessingComplete: isProcessingComplete(provenance.processor),
          canStartProcessing: !!provenance.lab?.verified,
          qrGenerated: !!provenance.processor?.qrCode
        };
      })
    );
    
    // Sort by submission date (newest first)
    enrichedBatches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      count: enrichedBatches.length,
      batches: enrichedBatches,
      summary: {
        total: enrichedBatches.length,
        qualityVerified: enrichedBatches.filter(b => b.isQualityVerified).length,
        readyForProcessing: enrichedBatches.filter(b => b.canStartProcessing && !b.processing).length,
        inProgress: enrichedBatches.filter(b => b.processing && !b.isProcessingComplete).length,
        completed: enrichedBatches.filter(b => b.isProcessingComplete).length,
        qrGenerated: enrichedBatches.filter(b => b.qrGenerated).length
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch processor batches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batches',
      message: error.message
    });
  }
});

/**
 * POST /api/processor/update-status
 * Update processing step status for a batch
 * 
 * Body: { batchID, step, status, processorId, processorName }
 * 
 * TODO: In Hyperledger Fabric, this would call:
 * fabric-network.submitTransaction('UpdateProcessing', processingUpdateJSON)
 */
router.post('/update-status', async (req, res) => {
  try {
    logger.info('🏭 Processing status update started');
    
    // Validate input
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
    }
    
    const { batchID, step, status, processorId, processorName, notes } = value;
    
    // Check if batch exists and has quality verification
    const provenance = await blockchainService.getProvenance(batchID);
    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }
    
    if (!provenance.lab?.verified) {
      return res.status(400).json({
        success: false,
        error: 'Cannot process batch without quality verification'
      });
    }
    
    // Get current processing state or create new one
    let processingStep = provenance.processor || {
      id: `PROC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      batchID: batchID,
      drying: 'pending',
      grinding: 'pending',
      packaging: 'pending',
      processorName: processorName,
      processorId: processorId,
      processDate: new Date().toISOString(),
      history: []
    };
    
    // Validate step progression
    const stepOrder = ['drying', 'grinding', 'packaging'];
    const currentStepIndex = stepOrder.indexOf(step);
    
    if (currentStepIndex > 0) {
      const previousStep = stepOrder[currentStepIndex - 1];
      if (processingStep[previousStep] !== 'completed') {
        return res.status(400).json({
          success: false,
          error: `Cannot start ${step} before completing ${previousStep}`
        });
      }
    }
    
    // Update the step
    processingStep[step] = status;
    processingStep.lastUpdated = new Date().toISOString();
    
    // Add to history
    if (!processingStep.history) {
      processingStep.history = [];
    }
    processingStep.history.push({
      step: step,
      status: status,
      timestamp: new Date().toISOString(),
      notes: notes || ''
    });
    
    // Submit to blockchain
    const txResult = await blockchainService.submitTransaction('processing', processingStep);
    
    logger.info(`✅ Processing status updated: ${batchID} - ${step}: ${status}`);
    
    res.json({
      success: true,
      message: `Processing step ${step} marked as ${status}`,
      transactionId: txResult.transactionId,
      hash: txResult.hash,
      processing: processingStep,
      isComplete: isProcessingComplete(processingStep)
    });
    
  } catch (error) {
    logger.error('❌ Processing status update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update processing status',
      message: error.message
    });
  }
});

/**
 * POST /api/processor/generate-qr
 * Generate QR code for completed batch
 * 
 * Body: { batchID, processorId }
 */
router.post('/generate-qr', async (req, res) => {
  try {
    logger.info('🔲 QR code generation started');
    
    // Validate input
    const { error, value } = generateQRSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
    }
    
    const { batchID, processorId } = value;
    
    // Check if batch processing is complete
    const provenance = await blockchainService.getProvenance(batchID);
    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }
    
    if (!isProcessingComplete(provenance.processor)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot generate QR code for incomplete processing'
      });
    }
    
    // Generate QR code data (URL for customer verification)
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/api/customer/batch/${batchID}`;
    
    // Generate QR code image
    const qrOptions = {
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#2d5016', // Forest green
        light: '#FFFFFF'
      },
      width: 256
    };
    
    const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, qrOptions);
    
    // Save QR code to file system
    const qrDir = path.join(process.env.UPLOAD_DIR || './uploads', 'qr-codes');
    await fs.mkdir(qrDir, { recursive: true });
    
    const qrFileName = `qr_${batchID}_${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    
    await fs.writeFile(qrFilePath, qrCodeBuffer);
    
    // Update processing record with QR info
    const updatedProcessing = {
      ...provenance.processor,
      qrCode: `/uploads/qr-codes/${qrFileName}`,
      qrGeneratedAt: new Date().toISOString(),
      verificationUrl: verificationUrl
    };
    
    // Submit QR generation to blockchain
    const txResult = await blockchainService.submitTransaction('processing', updatedProcessing);
    
    logger.info(`✅ QR code generated for batch: ${batchID}`);
    
    res.json({
      success: true,
      message: 'QR code generated successfully',
      batchID: batchID,
      qrCode: `/uploads/qr-codes/${qrFileName}`,
      verificationUrl: verificationUrl,
      transactionId: txResult.transactionId,
      hash: txResult.hash
    });
    
  } catch (error) {
    logger.error('❌ QR code generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      message: error.message
    });
  }
});

/**
 * GET /api/processor/batch/:id/status
 * Get detailed processing status for specific batch
 */
router.get('/batch/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const provenance = await blockchainService.getProvenance(id);
    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }
    
    const processingStatus = {
      batchID: id,
      farmer: provenance.farmer,
      qualityTest: provenance.lab,
      processing: provenance.processor,
      isQualityVerified: !!provenance.lab?.verified,
      canStartProcessing: !!provenance.lab?.verified,
      isComplete: isProcessingComplete(provenance.processor),
      qrGenerated: !!provenance.processor?.qrCode,
      nextStep: getNextProcessingStep(provenance.processor)
    };
    
    res.json({
      success: true,
      ...processingStatus
    });
    
  } catch (error) {
    logger.error('❌ Failed to fetch processing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processing status',
      message: error.message
    });
  }
});

/**
 * Utility: Check if processing is complete
 */
function isProcessingComplete(processing) {
  if (!processing) return false;
  
  return processing.drying === 'completed' &&
         processing.grinding === 'completed' &&
         processing.packaging === 'completed';
}

/**
 * Utility: Get next processing step
 */
function getNextProcessingStep(processing) {
  if (!processing) return 'drying';
  
  if (processing.drying !== 'completed') return 'drying';
  if (processing.grinding !== 'completed') return 'grinding';
  if (processing.packaging !== 'completed') return 'packaging';
  
  return 'complete';
}

module.exports = router;