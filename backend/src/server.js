/**
 * Express Server for SIH25027 - Blockchain-based Traceability of Ayurvedic Herbs
 * Prototype developed by Team Hackon
 * 
 * This server provides REST API endpoints for the traceability system.
 * It simulates blockchain functionality using local JSON storage.
 * 
 * In production, replace blockchain simulation with Hyperledger Fabric SDK calls.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const blockchainService = require('./services/blockchainService');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers');
const rateLimiter = require('./middleware/rateLimiter');

// Import route handlers
const farmerRoutes = require('./routes/farmer');
const labRoutes = require('./routes/lab');
const processorRoutes = require('./routes/processor');
const customerRoutes = require('./routes/customer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Serve static files (uploaded files, QR codes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/farmer', farmerRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/processor', processorRoutes);
app.use('/api/customer', customerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SIH25027 Traceability API',
    team: 'Team Hackon'
  });
});

// API Documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'SIH25027 - Blockchain Traceability API',
    version: '1.0.0',
    team: 'Team Hackon',
    description: 'REST API for Ayurvedic Herbs Traceability System',
    endpoints: {
      farmer: {
        'POST /api/farmer/upload': 'Submit collection event from farm',
        'GET /api/farmer/batches': 'Get farmer\'s submitted batches'
      },
      lab: {
        'POST /api/lab/upload': 'Submit quality test results',
        'GET /api/lab/tests': 'Get lab test history'
      },
      processor: {
        'GET /api/processor/batches': 'Get all batches for processing',
        'POST /api/processor/update-status': 'Update processing status',
        'POST /api/processor/generate-qr': 'Generate QR code for batch'
      },
      customer: {
        'GET /api/customer/batch/:id': 'Get complete provenance for batch',
        'POST /api/customer/verify': 'Verify QR code'
      }
    },
    blockchain_simulation: {
      note: 'This API simulates blockchain functionality',
      storage: 'Local JSON file (data/ledger.json)',
      production_todo: 'Replace with Hyperledger Fabric SDK calls'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SIH25027 - Blockchain-based Traceability of Ayurvedic Herbs',
    team: 'Prototype developed by Team Hackon',
    api_docs: '/api-docs',
    health: '/health',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize blockchain simulation service
blockchainService.initialize();

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 SIH25027 API Server running on port ${PORT}`);
  logger.info(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  logger.info(`🔗 Blockchain Simulation: ${process.env.SIMULATE_BLOCKCHAIN ? 'ENABLED' : 'DISABLED'}`);
  logger.info(`👥 Prototype developed by Team Hackon`);
  
  // Log blockchain initialization
  console.log('\n🔗 [BLOCKCHAIN SIMULATOR] Starting blockchain simulation...');
  console.log('📦 [BLOCKCHAIN SIMULATOR] Ledger file:', process.env.LEDGER_FILE_PATH || './data/ledger.json');
  console.log('✅ [BLOCKCHAIN SIMULATOR] Ready to process transactions\n');
});

module.exports = app;