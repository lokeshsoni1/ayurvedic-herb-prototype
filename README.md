# SIH25027 - Blockchain-based Traceability of Ayurvedic Herbs

**Prototype developed by Team Hackon**

## 🏆 Project Overview

This is a complete hackathon prototype for the Smart India Hackathon 2025 (SIH25027) - Blockchain-based Traceability of Ayurvedic Herbs. The system provides end-to-end traceability from farm to consumer using simulated blockchain technology.

## 🎯 Problem Statement

Enable complete traceability of Ayurvedic herbs through the supply chain to ensure authenticity, quality, and compliance with regulations.

## 🚀 Solution Architecture

```
Farmer → Lab → Processor → Customer
   ↓      ↓        ↓        ↓
[GPS] → [DNA] → [QR Gen] → [Verify]
   ↓      ↓        ↓        ↓
    Blockchain Ledger (Simulated)
```

## 📁 Repository Structure

```
sih25027-prototype-hackon/
├── README.md
├── LICENSE
├── package.json                    # Root package.json for monorepo
├── docker-compose.yml             # Full stack deployment
├── TESTING.md                     # Demo script for judges
├── .env.example                   # Environment variables template
├── 
├── frontend/                      # React.js web application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── backend/                       # Node.js + Express API server
│   ├── src/
│   ├── uploads/                   # File storage
│   ├── data/ledger.json          # Simulated blockchain storage
│   ├── package.json
│   └── .env.example
│
├── sample_data/                   # Demo JSON and test requests
│   ├── collection_event.json
│   ├── quality_test.json
│   ├── provenance_bundle.json
│   └── test_requests.http
│
└── docs/                         # Additional documentation
    ├── API.md
    └── DEPLOYMENT.md
```

## 🛠️ Technology Stack

**Frontend:**
- React.js 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Leaflet for maps
- QR Code generation

**Backend:**
- Node.js + Express.js
- Multer for file uploads
- JSON file storage (simulating blockchain)
- QR Code generation with `qrcode` library

**Blockchain Simulation:**
- In-memory ledger with persistence
- Transaction validation
- Geo-fencing and seasonal validation
- Smart contract simulation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Clone Repository
```bash
git clone https://github.com/your-username/sih25027-prototype-hackon.git
cd sih25027-prototype-hackon
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 4. Start Development Servers

**Option A: Using Docker (Recommended)**
```bash
docker-compose up --build
```

**Option B: Manual Start**
```bash
# Terminal 1: Start Backend (Port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 3000)
cd frontend
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 🧪 Testing Core Flows

### Flow 1: Farmer Collection Event
```bash
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
```

### Flow 2: Lab Quality Test
```bash
curl -X POST http://localhost:5000/api/lab/upload \
  -H "Content-Type: application/json" \
  -d '{
    "batchID": "BATCH_ASH_001",
    "dna": "ATCGATCGATCGATCG...",
    "pesticide": 0.03,
    "moisture": 12.5,
    "heavyMetals": 0.01,
    "labName": "Ayurveda Quality Labs Pvt Ltd",
    "labId": "LAB_AQL_001"
  }'
```

### Flow 3: Processor QR Generation
```bash
curl -X POST http://localhost:5000/api/processor/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"batchID": "BATCH_ASH_001"}'
```

### Flow 4: Customer Verification
```bash
curl http://localhost:5000/api/customer/batch/BATCH_ASH_001
```

## 🔧 Development Commands

```bash
# Root level commands
npm run start          # Start both frontend and backend
npm run start:frontend # Start only frontend
npm run start:backend  # Start only backend
npm run build         # Build both applications
npm run test          # Run all tests

# Frontend specific
cd frontend
npm start             # Development server
npm run build         # Production build
npm test              # Run tests

# Backend specific  
cd backend
npm run dev           # Development with nodemon
npm run start         # Production start
npm test              # Run API tests
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🌐 Deployment Instructions

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Set environment variables in deployment dashboard

### Backend (Render/Heroku)
1. Push to GitHub repository
2. Connect to Render/Heroku
3. Set environment variables
4. Deploy from `backend` directory

### Full Stack (DigitalOcean/AWS)
1. Use provided Dockerfile and docker-compose.yml
2. Set up reverse proxy (nginx)
3. Configure SSL certificates

## 📊 Demo Data & Testing

See `TESTING.md` for complete demo script including:
- Sample requests and responses  
- Expected UI behavior
- Ledger state snapshots
- QR code validation

Sample data available in `sample_data/` folder with ready-to-use JSON and HTTP requests.

## 🔗 Git Repository Setup

To push this code to a new GitHub repository:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit - SIH25027 prototype (Team Hackon)"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/your-username/sih25027-prototype-hackon.git

# Push to GitHub
git push -u origin main
```

## 🔄 Hyperledger Fabric Integration

This prototype uses simulated blockchain. For production deployment:

### 1. Replace Simulation Service
Current: `backend/src/services/blockchainSimulation.js`
Replace with: Hyperledger Fabric SDK calls

### 2. Smart Contract Development
Implement chaincode for:
- `CreateCollection(batchData)`
- `AddQualityTest(testData)`  
- `UpdateProcessing(processData)`
- `GetProvenance(batchID)`

### 3. Network Configuration
Set up Fabric network with organizations:
- Farmer Organization
- Lab Organization  
- Processor Organization
- Regulator Organization

### 4. Identity Management
Replace hardcoded IDs with Fabric CA certificates.

See inline TODOs in code for specific integration points.

## 🏗️ Architecture Notes

### What's Reconstructed vs Original
- ✅ **Frontend**: Fully reconstructed React application
- ✅ **Backend**: Newly created Express.js API server
- ✅ **Blockchain Simulation**: Custom implementation
- ✅ **Sample Data**: Generated based on requirements
- ✅ **Documentation**: Comprehensive guides created

### Key Features Implemented
- ✅ Role-based dashboards (Farmer, Lab, Processor, Customer)
- ✅ GPS coordinate validation and mapping
- ✅ QR code generation and scanning
- ✅ File upload simulation
- ✅ Provenance tracking end-to-end
- ✅ Blockchain transaction simulation
- ✅ Responsive UI with modern design

## 👥 Team Credits

**Prototype developed by Team Hackon**
- Smart India Hackathon 2025
- Problem Statement: SIH25027
- Blockchain-based Traceability of Ayurvedic Herbs

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support & Contact

For technical questions about this prototype:
1. Check `TESTING.md` for demo instructions
2. Review API documentation in `docs/API.md`
3. Check issues in GitHub repository
4. Contact Team Hackon for clarifications

## 🎯 Judging Points

This prototype demonstrates:
- **Complete traceability flow** from farm to consumer
- **Blockchain simulation** ready for Hyperledger Fabric integration  
- **Role-based access** with appropriate dashboards
- **GPS validation** and geo-fencing capabilities
- **QR code generation** for consumer verification
- **Professional UI/UX** with responsive design
- **Comprehensive documentation** for easy evaluation
- **Production-ready structure** for continued development

**Status**: ✅ PROTOTYPE COMPLETE - Ready for demonstration and further development