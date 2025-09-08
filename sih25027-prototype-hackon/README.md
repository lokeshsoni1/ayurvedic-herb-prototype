# HerbChain - Blockchain Traceability for Ayurvedic Herbs (SIH25027)

**Prototype proudly built by Team Hackon for SIH25027**

## 🏆 Project Overview

Complete blockchain-based traceability system for Ayurvedic herbs from farm to consumer. This prototype demonstrates end-to-end supply chain tracking using simulated blockchain technology, ready for Hyperledger Fabric integration.

## 🚀 Architecture

```
Frontend (Next.js) ←→ Backend (Express.js) ←→ Simulated Blockchain (ledger.json)
                                          ↓
                                    [TODO: Hyperledger Fabric]
```

## 📁 Repository Structure

```
sih25027-prototype-hackon/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── docker-compose.yml          # Full stack deployment
├── .env.example                # Environment variables template
│
├── frontend/                   # Next.js web application
│   ├── app/                    # App Router pages
│   │   ├── page.js            # 🔥 GENERATE NEXT: Landing page with role selection
│   │   ├── farmer/page.js     # 🔥 GENERATE NEXT: Farmer dashboard
│   │   ├── lab/page.js        # 🔥 GENERATE NEXT: Lab dashboard
│   │   ├── processor/page.js  # 🔥 GENERATE NEXT: Processor dashboard
│   │   ├── customer/page.js   # 🔥 GENERATE NEXT: Customer portal
│   │   └── compliance/page.js # 🔥 GENERATE NEXT: Compliance monitor
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities and API calls
│   ├── public/               # Static assets
│   └── package.json          # Dependencies
│
├── backend/                   # Express.js API server
│   ├── src/
│   │   ├── server.js         # 🔥 GENERATE NEXT: Main server file
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── middleware/       # Auth, validation, etc.
│   ├── data/
│   │   └── ledger.json       # ✅ CREATED: Simulated blockchain storage
│   └── package.json          # Dependencies
│
├── chaincode/                # Hyperledger Fabric smart contracts (placeholders)
│   └── HerbContract.js       # 🔥 GENERATE NEXT: Chaincode placeholder
│
└── sample_data/              # Demo data and test requests
    ├── collection_event.json # 🔥 GENERATE NEXT: Sample farmer data
    ├── quality_test.json     # 🔥 GENERATE NEXT: Sample lab data
    └── test_requests.http    # 🔥 GENERATE NEXT: API test commands
```

## 🛠️ Technology Stack

**Frontend:** Next.js 14, React, TailwindCSS, shadcn/ui components
**Backend:** Node.js, Express.js, multer (file uploads), qrcode library
**Storage:** JSON files (simulating blockchain)
**Maps:** Leaflet or Google Maps (with API key)
**QR Codes:** Node.js qrcode library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and Setup
```bash
git clone https://github.com/your-username/sih25027-prototype-hackon.git
cd sih25027-prototype-hackon
```

### 2. Environment Setup
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (Port 3000)
cd frontend
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 🧪 Demo Script (90 seconds for judges)

1. **Home Page** → Select Farmer role
2. **Farmer Dashboard** → Submit herb collection (GPS, species, moisture)
3. **Lab Dashboard** → Upload quality test results for batch
4. **Processor Dashboard** → Generate QR code for batch
5. **Customer Portal** → Scan QR or enter batch ID → View full provenance
6. **Compliance Monitor** → View regulatory status and risk analysis

## 📊 API Endpoints

```bash
# Farmer endpoints
POST /api/farmer/upload        # Submit collection event
GET  /api/farmer/batches       # List farmer's batches

# Lab endpoints  
POST /api/lab/upload           # Upload test results
GET  /api/lab/tests            # List lab tests

# Processor endpoints
GET  /api/processor/batches    # List all batches
POST /api/processor/generate-qr # Generate QR for batch

# Customer endpoints
GET  /api/customer/batch/:id   # Get batch provenance
POST /api/customer/verify      # Verify QR code

# Compliance endpoints
GET  /api/compliance/summary   # Get compliance statistics
POST /api/compliance/update    # Update regulatory status
```

## 🔗 Git Setup Commands

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

## 🏗️ Files Status

### ✅ Created (Ready)
- README.md
- .env.example files
- ledger.json structure
- LICENSE file
- docker-compose.yml

### 🔥 Generate Next (Critical)
- frontend/app/page.js (Landing page)
- frontend/app/compliance/page.js (Compliance monitor)
- backend/src/server.js (API server)
- chaincode/HerbContract.js (Smart contract placeholder)
- sample_data/*.json (Demo data)

### 📝 Generate Later (Important)
- Component files
- API route handlers
- Utility functions
- Test files

## 🔄 Hyperledger Fabric Integration Points

Search for `TODO: FABRIC` comments in code to find integration points:
- Replace REST API calls with Fabric gateway calls
- Replace ledger.json with Fabric ledger queries
- Implement chaincode functions in HerbContract.js

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team Credits

**Prototype proudly built by Team Hackon for SIH25027**
- Smart India Hackathon 2025
- Problem Statement: Blockchain-based Traceability of Ayurvedic Herbs

---

## 📋 Next Steps for Development

Ask the AI to generate specific files:
- "Generate code for frontend/app/page.js"
- "Generate code for backend/src/server.js" 
- "Generate code for chaincode/HerbContract.js"

Each file will be generated with complete, testable code and inline comments.