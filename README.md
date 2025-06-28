# 🛡️ Canispect — AI-Powered Canister Auditor for ICP

**Canispect** is a developer-first auditing platform for canisters on Internet Computer (ICP). It combines static analysis, AI-powered reasoning, and on-chain certification to transparently assess security, performance, and correctness.

## 🧠 Project Overview

Canispect is designed to fill a critical need in the ICP ecosystem by providing automated, transparent canister audits that merge AI assistance with formal analysis methods.

**Core Features:**

- 🔍 **AI-Powered WASM Analysis** - Upload and analyze canister WASM files with AI interpretation
- 🤖 **Security-Focused AI Assistant** - LLM trained on canister security patterns and vulnerabilities
- 📋 **On-Chain Audit Registry** - Immutable audit records with Internet Identity authentication
- 🛡️ **Mock Static Analysis Tools** - Simulated integration with tools like Owi and SeeWasm
- ⚛️ **Modern React UI** - Clean interface for audit workflows and history
- 🔐 **Internet Identity Integration** - Secure authentication and audit signing

**Architecture:**

```
WASM Upload → AI Analysis Engine → Audit Registry → Frontend Dashboard
     ↓              ↓                   ↓              ↓
Static Tools → AI Assistant → Certified Data → Internet Identity
```

---

## 📜 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [🔍 Using Canispect](#-using-canispect)
- [📁 Project Structure](#-project-structure)
- [🧪 Testing](#-testing)
- [🛠️ Development](#-development)
- [🚀 Deployment](#-deployment)
- [🔗 Resources](#-resources)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **Rust** (latest stable)
- **dfx** (DFINITY SDK)
- **Internet Identity** for authentication

### 🧑‍💻 1. Setup Development Environment

#### Option A: GitHub Codespaces (Recommended)

- Click "Use this Template" → "Create a new repository"
- Click "Code → Open with Codespaces"
- Select machine type: 4-core 16GB RAM • 32GB
- Everything is pre-configured and ready!

#### Option B: Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd Canispect

# Install dependencies
npm install
```

### 2. Configure AI Analysis (Optional)

For enhanced AI-powered analysis, set up Ollama:

```bash
# Start Ollama server
ollama serve
# Expected to start listening on port 11434

# In a separate terminal, download the LLM model
ollama run llama3.1:8b
# Type /bye to exit after model is downloaded
```

### 3. Deploy Canisters

```bash
# Start local Internet Computer replica
dfx start --clean

# In another terminal, deploy dependencies
dfx deps pull
dfx deps deploy  # Deploys the LLM canister

# Deploy Canispect canisters
dfx deploy
```

### 4. Start Development Server

```bash
# Start the frontend development server
npm start
```

Visit `http://localhost:5173` to access Canispect!

---

## 🔍 Using Canispect

### 1. Authentication

- Click **"Connect with Internet Identity"** to authenticate
- Your Internet Identity will be used to sign audit records

### 2. Analyze WASM Files

#### Upload and Analyze

1. Navigate to the **"Analyze WASM"** tab
2. **Drag & drop** a `.wasm` file or click to browse
3. Fill in **metadata** (optional):
   - Canister name and description
   - Version information
   - Canister ID (if analyzing deployed canister)
4. Click **"Analyze Security"**

#### Analysis Results

Canispect provides comprehensive analysis including:

- **📊 Static Analysis**: Mock integration with tools like Owi and SeeWasm
- **🤖 AI Analysis**: AI-powered security assessment and recommendations
- **⚠️ Security Findings**: Categorized vulnerabilities with severity levels
- **📈 Code Metrics**: File size, complexity, and estimated lines of code
- **✅ Recommendations**: Actionable security improvements

### 3. View Audit History

- Navigate to **"Audit History"** tab
- View past audits and their results
- Filter by severity and status
- Access detailed audit records

### 4. Generate Test WASM Files

For testing purposes, use the built-in generators:

```bash
# Generate all test WASM files
npm run generate-test-wasm

# Generate specific type
npm run quick-wasm minimal
npm run quick-wasm suspicious
```

Test files are created in `/test-data/` and include:

- **minimal.wasm**: Basic WASM validation
- **simple.wasm**: Function analysis testing
- **complex.wasm**: Multi-function analysis
- **suspicious.wasm**: Security vulnerability detection

---

## 📁 Project Structure

```
Canispect/
├── .devcontainer/devcontainer.json       # Development container configuration
├── .github/instructions/                 # AI assistant instructions for development
├── src/
│   ├── backend/                          # Rust backend canister for WASM analysis
│   │   ├── src/
│   │   │   └── lib.rs                    # AI-powered analysis engine
│   │   ├── backend.did                   # Candid interface definition
│   │   └── Cargo.toml                    # Rust dependencies
│   ├── audit_registry/                   # Rust canister for audit record storage
│   │   ├── src/
│   │   │   └── lib.rs                    # On-chain audit registry
│   │   ├── audit_registry.did            # Candid interface definition
│   │   └── Cargo.toml                    # Rust dependencies
│   ├── frontend/                         # React + Tailwind frontend
│   │   ├── src/
│   │   │   ├── App.tsx                   # Main Canispect application
│   │   │   ├── components/               # UI components
│   │   │   │   ├── WasmUpload.tsx        # File upload component
│   │   │   │   ├── AnalysisResults.tsx   # Results display
│   │   │   │   ├── AuditHistory.tsx      # Audit history viewer
│   │   │   │   └── AuthButton.tsx        # Internet Identity auth
│   │   │   ├── services/                 # Canister service layers
│   │   │   │   ├── auth.ts               # Authentication service
│   │   │   │   ├── audit.ts              # Audit operations
│   │   │   │   └── canispect.ts          # Main service
│   │   │   └── views/                    # Page-level components
│   │   ├── package.json                  # Frontend dependencies
│   │   └── vite.config.ts                # Vite build configuration
│   └── declarations/                     # Auto-generated canister interfaces
├── scripts/
│   ├── generate-test-wasm.js             # WASM test file generator
│   ├── quick-wasm-gen.js                 # Quick WASM generator CLI
│   └── generate-candid.sh                # Candid generation script
├── test-data/                            # Generated test WASM files (not tracked)
├── tests/
│   ├── src/                              # Backend test files
│   └── vitest.config.ts                  # Test configuration
├── dfx.json                              # Internet Computer configuration
├── Cargo.toml                            # Root Rust workspace
└── README.md                             # This file
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Backend Tests

```bash
npm test tests/src/backend.test.ts
```

### Frontend Tests

```bash
npm test --workspace=frontend
```

### Generate Test WASM Files

```bash
# Generate all test WASM files with metadata
npm run generate-test-wasm

# Generate specific WASM type
npm run quick-wasm minimal      # Minimal WASM (8 bytes)
npm run quick-wasm simple       # Simple function WASM
npm run quick-wasm complex      # Multi-function WASM
npm run quick-wasm suspicious   # WASM with security patterns
```

---

## 🛠️ Development

### Code Quality

```bash
# Format and lint all code
npm run format

# Check TypeScript errors
npx tsc -p src/frontend/tsconfig.json

# Check Rust code
cargo check
```

### Generate Candid Interfaces

```bash
# Regenerate Candid files after interface changes
npm run generate-candid
```

### Development Commands

```bash
# Start local replica
dfx start --clean

# Deploy all canisters
dfx deploy

# Start frontend dev server
npm start
```

---

## 🚀 Deployment

### Production Deployment

1. **Configure for Mainnet**:

   ```bash
   # Set up mainnet environment
   dfx deploy --network ic
   ```

2. **Update Frontend URLs**:

   - Update canister URLs in frontend services
   - Configure Internet Identity for production

3. **Deploy Steps**:
   ```bash
   # Deploy to Internet Computer mainnet
   dfx deploy --network ic --with-cycles 1000000000000
   ```

### GitHub Codespaces Deployment

The project is optimized for GitHub Codespaces with:

- Pre-configured development container
- Automatic dependency installation
- Ready-to-use development environment

---

## 🔗 Resources

### Canispect Resources

- **Test WASM Files**: Generated in `/test-data/` directory
- **Candid Interfaces**: Available in `/src/declarations/`
- **AI Analysis**: Powered by Ollama + Llama 3.1 8B model

### Internet Computer Development

- [ICP Developer Documentation](https://internetcomputer.org/docs)
- [Rust CDK Documentation](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [Internet Identity Integration](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/)

### Security Analysis Tools

- [Owi - WASM Symbolic Execution](https://github.com/OCamlPro/owi)
- [SeeWasm - WASM Analysis](https://github.com/rustwasm/wasm-pack)
- [WACANA - Concolic Fuzzing](https://arxiv.org/abs/2007.15510)

### Development Tools

- [dfx SDK Documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- [PocketIC Testing Framework](https://dfinity.github.io/pic-js/)
- [Vitest Testing Framework](https://vitest.dev/)
- [React + Tailwind CSS](https://tailwindcss.com/)

---

### 🤝 Contributing

We welcome contributions to Canispect! To contribute:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run tests**: `npm test`
5. **Format code**: `npm run format`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Issues and Feature Requests

- Report bugs or request features via [GitHub Issues](https://github.com/rtb-12/Canispect/issues)
- Include steps to reproduce for bugs
- Describe the expected behavior for feature requests

---

**🛡️ Secure your canisters with AI-powered analysis! 🚀**
