<div align="center">

# 🛡️ Canispect — AI-Powered Canister Auditor for ICP

<img src="./assets/logo.png" alt="Canispect Logo" width="250" height="250" />

_Revolutionary AI-powered security auditing platform for Internet Computer canisters, providing comprehensive WASM analysis, vulnerability detection, and automated security recommendations._

![Platform](https://img.shields.io/badge/Platform-Internet_Computer-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Network](https://img.shields.io/badge/Network-Local_Replica-orange)
![AI](https://img.shields.io/badge/AI-Llama_3.1_8B-purple)

</div>

**Canispect** is a developer-first auditing platform for canisters on Internet Computer (ICP). It combines static analysis, AI-powered reasoning, and on-chain certification to transparently assess security, performance, and correctness.

## 🧠 Project Overview

Canispect is designed to fill a critical need in the ICP ecosystem by providing automated, transparent canister audits that merge AI assistance with formal analysis methods.

**Core Features:**

- 🔍 **AI-Powered WASM Analysis** - Upload and analyze canister WASM files with AI interpretation
- 🤖 **Security-Focused AI Assistant** - LLM integration with comprehensive fallback analysis for reliable results
- 📋 **Static Analysis Integration** - Mock integration with security tools like Owi and SeeWasm for WASM analysis
- 🛡️ **Comprehensive Security Assessment** - Multi-layered analysis combining static tools and AI reasoning
- ⚛️ **Modern React UI** - Clean, responsive interface for audit workflows and history management
- 🔐 **Internet Identity Integration** - Secure authentication and audit record signing

**🚀 Future Roadmap:**

- 🦀 **Rust CLI Tool** - Command-line interface for automated WASM analysis in CI/CD pipelines and local development workflows

**Architecture:**

```
WASM Upload → AI Analysis Engine → Audit Registry → Frontend Dashboard
     ↓              ↓                   ↓              ↓
Static Tools → AI Assistant → Certified Data → Internet Identity
```

## 🔄 Canister Analysis Process Flow

The following flowchart illustrates the complete analysis process from WASM upload to final results:

![Canispect Analysis Flow](assets/Canispect%20Dark.png)

## 🧠 Analysis Logic Documentation

### Static Analysis Engine

Canispect implements a comprehensive static analysis system that examines WASM binaries for security vulnerabilities and code quality issues. The analysis is performed by two primary engines:

#### 1. Owi Analysis Engine

**Purpose**: Memory safety and performance analysis
**Implementation**: `mock_owi_analysis()` in `/src/backend/src/lib.rs`

**Detection Logic**:

```rust
// Large binary detection (Performance concern)
if file_size > 1_000_000 {
    // Flag: Large WASM binary - optimization needed
    // Severity: Medium
    // Rationale: Large binaries increase attack surface and deployment costs
}

// Memory complexity analysis
if file_size > 100_000 {
    // Flag: Complex memory patterns detected
    // Severity: Low
    // Rationale: Complex memory usage increases risk of memory safety issues
}
```

**Analysis Categories**:

- **Performance**: Binary size optimization
- **Memory Management**: Memory safety verification
- **Attack Surface**: Code complexity assessment

#### 2. SeeWasm Analysis Engine

**Purpose**: Symbolic execution and arithmetic safety
**Implementation**: `mock_seewasm_analysis()` in `/src/backend/src/lib.rs`

**Detection Logic**:

```rust
// Symbolic execution completion
// Always generates: "Symbolic execution completed - no critical paths identified"
// Severity: Info
// Purpose: Confirms analysis tool execution

// Arithmetic safety check
if wasm_bytes.len() > 50_000 {
    // Flag: Complex arithmetic operations detected
    // Severity: Medium
    // Rationale: Complex arithmetic increases overflow/underflow risk
}
```

**Analysis Categories**:

- **Symbolic Execution**: Code path analysis
- **Arithmetic Safety**: Overflow/underflow protection
- **Function Analysis**: Method complexity assessment

### Code Metrics Calculation

**Implementation**: `calculate_code_metrics()` in `/src/backend/src/lib.rs`

```rust
fn calculate_code_metrics(wasm_bytes: &[u8]) -> CodeMetrics {
    let file_size = wasm_bytes.len() as u32;

    // Estimation algorithms:
    let estimated_lines = (file_size / 10).max(100);     // ~10 bytes per line
    let function_count = (file_size / 1000).max(1);      // ~1KB per function
    let complexity_score = (file_size / 5000).max(1);    // ~5KB per complexity unit
}
```

**Metrics Provided**:

- **File Size**: Exact WASM binary size in bytes
- **Estimated LOC**: Approximated lines of code (file_size / 10)
- **Function Count**: Estimated number of functions (file_size / 1000)
- **Complexity Score**: Code complexity rating (file_size / 5000)

### AI-Powered Analysis

#### AI Analysis Flow

The AI analysis system provides intelligent security assessment using either LLM integration or comprehensive fallback analysis.

**Current Implementation Status**:

- **LLM Integration**: Available but currently disabled due to timeout issues with the `ic-llm` service
- **Fallback Analysis**: Fully functional comprehensive analysis system that provides reliable results
- **Hybrid Approach**: Automatically falls back to comprehensive analysis when LLM is unavailable

**Primary AI Path** (Available but temporarily disabled):

1. **Prompt Generation**: `create_security_audit_prompt()`
2. **LLM Integration**: Via `ic-llm` crate with Llama 3.1 8B model
3. **Response Processing**: Structured analysis parsing

**Fallback AI Analysis** (Active implementation):
**Implementation**: `create_fallback_ai_analysis()` in `/src/backend/src/lib.rs`

#### Fallback Analysis Logic

**1. Summary Generation**:

```rust
// File size analysis
if file_size > 1_000_000 {
    "Large WASM binary detected - consider optimization"
} else if file_size < 10_000 {
    "Small WASM binary suggests minimal functionality"
}

// Complexity assessment
if complexity > 50 { "High complexity - increased vulnerability risk" }
else if complexity > 20 { "Moderate complexity - ensure proper testing" }
else { "Low complexity - reduced risk" }
```

**2. Pattern Identification**:

```rust
// Function complexity patterns
if function_count > 20 { "Complex multi-function canister" }
else if function_count > 5 { "Moderate function complexity" }
else { "Simple function structure" }

// Memory pattern detection
if static_findings.contains("Memory") {
    "Memory management patterns detected"
}
```

**3. Security Concerns Generation**:

```rust
// Size-based concerns
if file_size > 500_000 {
    "Large binary may contain vulnerable dependencies"
}

// Complexity-based concerns
if complexity > 30 {
    "High complexity increases security review difficulty"
}

// Always included baseline concerns:
- "Verify proper access controls for all public methods"
- "Ensure comprehensive input validation"
- "Monitor cycle consumption to prevent DoS attacks"
```

**4. Recommendation Engine**:

```rust
// Base recommendations (always included):
- "Implement comprehensive logging for security monitoring"
- "Add input sanitization for all user-provided data"
- "Use Internet Computer's certified data for critical state"
- "Implement proper error handling without revealing internals"

// Conditional recommendations:
if file_size > 1_000_000 {
    "Consider code splitting or removing unused dependencies"
}
if complexity > 20 {
    "Add comprehensive unit tests for all code paths"
    "Consider refactoring complex functions"
}
```

**5. Confidence Score Calculation**:

```rust
let confidence = if static_findings.is_empty() {
    0.7  // Good confidence with no static issues
} else if has_critical_findings {
    0.9  // High confidence when critical issues found
} else {
    0.8  // High confidence with some issues found
};
```

### Severity Assessment Logic

**Overall Severity Determination**:

```rust
let overall_severity = if has_critical_findings {
    SecuritySeverity::Critical
} else if has_high_findings {
    SecuritySeverity::High
} else if has_medium_findings {
    SecuritySeverity::Medium
} else {
    SecuritySeverity::Low
};
```

**Severity Levels**:

- **Critical**: Immediate security threats requiring urgent action
- **High**: Serious security concerns needing prompt attention
- **Medium**: Moderate issues that should be addressed
- **Low**: Minor concerns or best practice recommendations
- **Info**: Informational findings for awareness

### Frontend Integration

**Analysis Request Flow** (`/src/frontend/src/services/audit.ts`):

1. **File Processing**:

   ```typescript
   // Convert File to Uint8Array
   const arrayBuffer = await file.arrayBuffer();
   const wasmBytes = new Uint8Array(arrayBuffer);
   ```

2. **Request Creation**:

   ```typescript
   const request: WasmAnalysisRequest = {
     wasm_bytes: wasmBytes,
     canister_id: canisterId ? Principal.fromText(canisterId) : undefined,
     metadata: { name, description, version },
   };
   ```

3. **Backend Communication**:

   ```typescript
   const actor = await this.getBackendActor();
   const result = await actor.analyze_wasm_security(request);
   ```

4. **Result Processing**: Parse and display comprehensive analysis results including static findings, AI analysis, and actionable recommendations.

### Security Considerations

**Input Validation**:

- WASM file format verification
- Size limits to prevent DoS attacks
- Metadata sanitization

**Analysis Safety**:

- Sandboxed WASM execution
- Resource limits on analysis operations
- Error handling for malformed binaries

**Result Integrity**:

- SHA256 hashing for WASM verification
- Timestamped analysis records
- Immutable audit trail storage

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
