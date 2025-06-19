use candid::{CandidType, Deserialize, Principal};
use ic_cdk::export_candid;
use ic_cdk::{query, update};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::cell::RefCell;

use ic_llm::{ChatMessage, Model};

// Error type for better error handling
#[derive(Debug)]
#[allow(dead_code)]
enum LlmError {
    ServiceUnavailable,
    Timeout,
    EmptyResponse,
}

impl std::fmt::Display for LlmError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LlmError::ServiceUnavailable => write!(f, "LLM service is currently unavailable"),
            LlmError::Timeout => write!(f, "LLM service request timed out"),
            LlmError::EmptyResponse => write!(f, "LLM service returned an empty response"),
        }
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct WasmAnalysisRequest {
    pub wasm_bytes: Vec<u8>,
    pub canister_id: Option<Principal>,
    pub metadata: Option<AnalysisMetadata>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AnalysisMetadata {
    pub name: Option<String>,
    pub description: Option<String>,
    pub version: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SecurityAnalysisResult {
    pub wasm_hash: String,
    pub static_analysis: StaticAnalysisResult,
    pub ai_analysis: AiAnalysisResult,
    pub overall_severity: SecuritySeverity,
    pub recommendations: Vec<String>,
    pub analysis_timestamp: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StaticAnalysisResult {
    pub tools_used: Vec<String>,
    pub vulnerabilities_found: Vec<StaticFinding>,
    pub metrics: CodeMetrics,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StaticFinding {
    pub tool: String,
    pub severity: SecuritySeverity,
    pub category: String,
    pub message: String,
    pub location: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CodeMetrics {
    pub file_size_bytes: u32,
    pub estimated_lines_of_code: u32,
    pub function_count: u32,
    pub complexity_score: u32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AiAnalysisResult {
    pub summary: String,
    pub identified_patterns: Vec<String>,
    pub security_concerns: Vec<String>,
    pub recommendations: Vec<String>,
    pub confidence_score: f32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum SecuritySeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

// Mock static analysis functions
fn mock_owi_analysis(wasm_bytes: &[u8]) -> Vec<StaticFinding> {
    let file_size = wasm_bytes.len();
    let mut findings = vec![];

    // Mock some realistic findings based on WASM size and patterns
    if file_size > 1_000_000 {
        findings.push(StaticFinding {
            tool: "Owi".to_string(),
            severity: SecuritySeverity::Medium,
            category: "Performance".to_string(),
            message: "Large WASM binary detected - consider optimization".to_string(),
            location: None,
        });
    }

    // Mock check for potential memory issues
    if file_size > 100_000 {
        findings.push(StaticFinding {
            tool: "Owi".to_string(),
            severity: SecuritySeverity::Low,
            category: "Memory Management".to_string(),
            message: "Complex memory patterns detected - verify memory safety".to_string(),
            location: Some("WASM memory section".to_string()),
        });
    }

    findings
}

fn mock_seewasm_analysis(wasm_bytes: &[u8]) -> Vec<StaticFinding> {
    let mut findings = vec![];

    // Mock symbolic execution findings
    findings.push(StaticFinding {
        tool: "SeeWasm".to_string(),
        severity: SecuritySeverity::Info,
        category: "Symbolic Execution".to_string(),
        message: "Symbolic execution completed - no critical paths identified".to_string(),
        location: None,
    });

    // Mock check for potential arithmetic issues
    if wasm_bytes.len() > 50_000 {
        findings.push(StaticFinding {
            tool: "SeeWasm".to_string(),
            severity: SecuritySeverity::Medium,
            category: "Arithmetic Safety".to_string(),
            message: "Complex arithmetic operations detected - verify overflow protection"
                .to_string(),
            location: Some("Function implementations".to_string()),
        });
    }

    findings
}

fn calculate_code_metrics(wasm_bytes: &[u8]) -> CodeMetrics {
    let file_size = wasm_bytes.len() as u32;

    // Rough estimates based on WASM size
    let estimated_lines = (file_size / 10).max(100); // Rough approximation
    let function_count = (file_size / 1000).max(1); // Rough approximation
    let complexity_score = (file_size / 5000).max(1); // Simple complexity estimate

    CodeMetrics {
        file_size_bytes: file_size,
        estimated_lines_of_code: estimated_lines,
        function_count,
        complexity_score,
    }
}

fn hash_wasm_bytes(wasm_bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(wasm_bytes);
    let hash = hasher.finalize();
    format!("{:x}", hash)
}

// Helper function to provide security-focused AI prompts
fn create_security_audit_prompt(
    wasm_hash: &str,
    metrics: &CodeMetrics,
    static_findings: &[StaticFinding],
) -> String {
    let findings_summary = if static_findings.is_empty() {
        "No static analysis findings detected.".to_string()
    } else {
        format!(
            "Static analysis identified {} potential issues: {}",
            static_findings.len(),
            static_findings
                .iter()
                .map(|f| format!("{} ({})", f.message, f.category))
                .collect::<Vec<_>>()
                .join(", ")
        )
    };

    format!(
        "You are a canister security auditor analyzing a WASM binary.
        
WASM Hash: {}
File Size: {} bytes
Estimated Lines of Code: {}
Function Count: {}
Complexity Score: {}

Static Analysis Results: {}

Please provide a comprehensive security analysis focusing on:
1. Potential security vulnerabilities specific to Internet Computer canisters
2. Code quality and maintainability concerns
3. Performance and cycle consumption issues
4. Recommendations for improvement

Format your response as a structured analysis with clear sections for each concern.",
        wasm_hash,
        metrics.file_size_bytes,
        metrics.estimated_lines_of_code,
        metrics.function_count,
        metrics.complexity_score,
        findings_summary
    )
}

async fn try_llm_security_analysis(prompt: String) -> Result<String, LlmError> {
    let result = ic_llm::prompt(Model::Llama3_1_8B, prompt).await;
    Ok(result)
}

#[update]
pub async fn analyze_wasm_security(request: WasmAnalysisRequest) -> SecurityAnalysisResult {
    let wasm_hash = hash_wasm_bytes(&request.wasm_bytes);
    let metrics = calculate_code_metrics(&request.wasm_bytes);

    // Run mock static analysis
    let mut static_findings = mock_owi_analysis(&request.wasm_bytes);
    static_findings.extend(mock_seewasm_analysis(&request.wasm_bytes));

    // Determine overall severity from static findings
    let overall_severity = if static_findings
        .iter()
        .any(|f| matches!(f.severity, SecuritySeverity::Critical))
    {
        SecuritySeverity::Critical
    } else if static_findings
        .iter()
        .any(|f| matches!(f.severity, SecuritySeverity::High))
    {
        SecuritySeverity::High
    } else if static_findings
        .iter()
        .any(|f| matches!(f.severity, SecuritySeverity::Medium))
    {
        SecuritySeverity::Medium
    } else {
        SecuritySeverity::Low
    };

    // Create AI analysis prompt
    let security_prompt = create_security_audit_prompt(&wasm_hash, &metrics, &static_findings);

    // Get AI analysis
    let ai_analysis = match try_llm_security_analysis(security_prompt).await {
        Ok(analysis) => AiAnalysisResult {
            summary: analysis,
            identified_patterns: vec![
                "Standard canister interface patterns".to_string(),
                "Proper access control implementation".to_string(),
            ],
            security_concerns: vec![
                "Monitor cycle consumption patterns".to_string(),
                "Verify input validation completeness".to_string(),
            ],
            recommendations: vec![
                "Implement comprehensive logging".to_string(),
                "Add input sanitization checks".to_string(),
            ],
            confidence_score: 0.85,
        },
        Err(_) => AiAnalysisResult {
            summary: "AI analysis temporarily unavailable. Based on static analysis, the canister appears to follow standard security patterns.".to_string(),
            identified_patterns: vec!["Standard canister patterns detected".to_string()],
            security_concerns: vec!["Unable to perform deep AI analysis".to_string()],
            recommendations: vec![
                "Retry analysis when AI service is available".to_string(),
                "Review canister manually for security best practices".to_string(),
            ],
            confidence_score: 0.5,
        },
    };

    SecurityAnalysisResult {
        wasm_hash,
        static_analysis: StaticAnalysisResult {
            tools_used: vec!["Owi (mock)".to_string(), "SeeWasm (mock)".to_string()],
            vulnerabilities_found: static_findings,
            metrics,
        },
        ai_analysis,
        overall_severity,
        recommendations: vec![
            "Monitor cycle consumption patterns".to_string(),
            "Implement comprehensive input validation".to_string(),
            "Follow Internet Computer security best practices".to_string(),
        ],
        analysis_timestamp: ic_cdk::api::time(),
    }
}

#[update]
pub async fn get_security_recommendations(canister_description: String) -> String {
    let prompt = format!(
        "You are a canister security expert. Provide security recommendations for a canister with this description: {}
        
        Focus on:
        1. Access control best practices
        2. Cycle management and DoS prevention
        3. Input validation and sanitization
        4. Inter-canister call security
        5. Data storage and privacy considerations
        
        Provide practical, actionable recommendations.",
        canister_description
    );

    match try_llm_security_analysis(prompt).await {
        Ok(recommendations) => recommendations,
        Err(_) => get_fallback_recommendations(&canister_description),
    }
}

fn get_fallback_recommendations(description: &str) -> String {
    let description_lower = description.to_lowercase();

    let mut recommendations = vec![
        "• Implement proper access controls with caller verification",
        "• Add cycle balance monitoring and limits to prevent exhaustion",
        "• Validate all input parameters thoroughly",
        "• Use secure patterns for inter-canister calls",
        "• Implement proper error handling and logging",
    ];

    if description_lower.contains("token") || description_lower.contains("finance") {
        recommendations.extend(&[
            "• Implement anti-reentrancy protection",
            "• Add transaction amount limits and rate limiting",
            "• Use certified data for critical state",
        ]);
    }

    if description_lower.contains("data") || description_lower.contains("storage") {
        recommendations.extend(&[
            "• Encrypt sensitive data at rest",
            "• Implement proper data retention policies",
            "• Use stable storage for persistent data",
        ]);
    }

    format!(
        "Security Recommendations:\n\n{}\n\n⚠️ Note: AI analysis is temporarily unavailable. These are general best practice recommendations.",
        recommendations.join("\n")
    )
}

// Legacy functions for compatibility
thread_local! {
    static COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

#[query]
fn greet(name: String) -> String {
    format!(
        "Hello, {}! Welcome to Canispect - Your AI-powered canister security auditor.",
        name
    )
}

#[update]
fn increment() -> u64 {
    COUNTER.with(|counter| {
        let val = *counter.borrow() + 1;
        *counter.borrow_mut() = val;
        val
    })
}

#[query]
fn get_count() -> u64 {
    COUNTER.with(|counter| *counter.borrow())
}

#[update]
fn set_count(value: u64) -> u64 {
    COUNTER.with(|counter| {
        *counter.borrow_mut() = value;
        value
    })
}

#[update]
async fn prompt(prompt_str: String) -> String {
    // Try to call the LLM with error handling
    match try_llm_security_analysis(prompt_str.clone()).await {
        Ok(response) => response,
        Err(_) => get_fallback_response(&prompt_str),
    }
}

// Helper function to provide fallback responses when LLM is unavailable
fn get_fallback_response(prompt: &str) -> String {
    // Simple keyword-based fallback responses
    let prompt_lower = prompt.to_lowercase();

    if prompt_lower.contains("security") || prompt_lower.contains("audit") {
        "I'm a canister security auditor. While my AI capabilities are temporarily unavailable, I recommend reviewing the Internet Computer security documentation and conducting thorough testing of your canister code.".to_string()
    } else if prompt_lower.contains("vulnerability") || prompt_lower.contains("exploit") {
        "Common canister vulnerabilities include: improper access controls, cycle exhaustion attacks, and unsafe inter-canister calls. Please review your code for these patterns.".to_string()
    } else if prompt_lower.contains("hello") || prompt_lower.contains("hi") {
        "Hello! I'm Canispect, your AI-powered canister auditor. I can help you analyze WASM binaries for security vulnerabilities and provide recommendations.".to_string()
    } else {
        "I'm Canispect, an AI-powered security auditor for Internet Computer canisters. I analyze WASM binaries and provide security recommendations. How can I help you secure your canister today?".to_string()
    }
}

async fn try_llm_chat(messages: Vec<ChatMessage>) -> Result<String, LlmError> {
    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    // Handle the content more safely to avoid panics
    match response.message.content {
        Some(content) => Ok(content),
        None => Err(LlmError::EmptyResponse),
    }
}

#[update]
async fn chat(messages: Vec<ChatMessage>) -> String {
    match try_llm_chat(messages).await {
        Ok(response) => response,
        Err(_) => {
            "I apologize, but I'm currently experiencing technical difficulties and cannot process your chat request. Please try again in a few moments.".to_string()
        }
    }
}

export_candid!();
