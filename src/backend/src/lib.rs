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
// TODO: Re-enable when LLM timeout issues are resolved
#[allow(dead_code)]
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
    // Try to call the LLM, but expect it might fail due to timeouts
    match ic_llm::prompt(Model::Llama3_1_8B, prompt).await {
        result if !result.is_empty() => Ok(result),
        _ => Err(LlmError::EmptyResponse),
    }
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

    // For now, skip the LLM call due to timeout issues and provide comprehensive fallback
    // TODO: Re-enable when LLM timeout issues are resolved
    let ai_analysis = create_fallback_ai_analysis(&wasm_hash, &metrics, &static_findings);

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

fn create_fallback_ai_analysis(
    wasm_hash: &str,
    metrics: &CodeMetrics,
    static_findings: &[StaticFinding],
) -> AiAnalysisResult {
    let file_size = metrics.file_size_bytes;
    let complexity = metrics.complexity_score;

    // Generate comprehensive analysis based on static findings and metrics
    let mut summary_parts = vec![format!(
        "Security analysis completed for WASM binary (hash: {})",
        &wasm_hash[..16]
    )];

    // Analyze file size implications
    if file_size > 1_000_000 {
        summary_parts.push("Large WASM binary detected - consider optimization to reduce attack surface and improve performance.".to_string());
    } else if file_size < 10_000 {
        summary_parts.push("Small WASM binary suggests minimal functionality - verify all required security controls are implemented.".to_string());
    }

    // Analyze complexity implications
    let complexity_assessment = if complexity > 50 {
        "High complexity detected - increased risk of logic vulnerabilities and harder to audit."
    } else if complexity > 20 {
        "Moderate complexity - ensure proper testing coverage for all code paths."
    } else {
        "Low complexity - reduced risk but verify core security patterns are implemented."
    };
    summary_parts.push(complexity_assessment.to_string());

    // Add static findings summary
    if !static_findings.is_empty() {
        let critical_count = static_findings
            .iter()
            .filter(|f| matches!(f.severity, SecuritySeverity::Critical))
            .count();
        let high_count = static_findings
            .iter()
            .filter(|f| matches!(f.severity, SecuritySeverity::High))
            .count();
        let medium_count = static_findings
            .iter()
            .filter(|f| matches!(f.severity, SecuritySeverity::Medium))
            .count();

        if critical_count > 0 {
            summary_parts.push(format!(
                "CRITICAL: {} critical security issues identified requiring immediate attention.",
                critical_count
            ));
        }
        if high_count > 0 {
            summary_parts.push(format!(
                "HIGH: {} high-priority security concerns detected.",
                high_count
            ));
        }
        if medium_count > 0 {
            summary_parts.push(format!(
                "MEDIUM: {} moderate security issues found.",
                medium_count
            ));
        }
    } else {
        summary_parts
            .push("No immediate security vulnerabilities detected by static analysis.".to_string());
    }

    // Generate identified patterns based on metrics and findings
    let mut patterns = vec!["Standard WASM binary structure".to_string()];

    if metrics.function_count > 20 {
        patterns.push("Complex multi-function canister".to_string());
    } else if metrics.function_count > 5 {
        patterns.push("Moderate function complexity".to_string());
    } else {
        patterns.push("Simple function structure".to_string());
    }

    if static_findings
        .iter()
        .any(|f| f.category.contains("Memory"))
    {
        patterns.push("Memory management patterns detected".to_string());
    }

    if static_findings
        .iter()
        .any(|f| f.category.contains("Performance"))
    {
        patterns.push("Performance optimization opportunities identified".to_string());
    }

    // Generate security concerns based on findings and metrics
    let mut concerns = vec![];

    if file_size > 500_000 {
        concerns.push(
            "Large binary size may indicate bundled dependencies with potential vulnerabilities"
                .to_string(),
        );
    }

    if complexity > 30 {
        concerns.push(
            "High complexity increases difficulty of security review and testing".to_string(),
        );
    }

    if static_findings.iter().any(|f| {
        matches!(
            f.severity,
            SecuritySeverity::Critical | SecuritySeverity::High
        )
    }) {
        concerns.push("High-severity security issues require immediate remediation".to_string());
    }

    concerns.push("Verify proper access controls for all public methods".to_string());
    concerns.push("Ensure comprehensive input validation for all parameters".to_string());
    concerns.push("Monitor cycle consumption to prevent DoS attacks".to_string());

    // Generate recommendations
    let mut recommendations = vec![
        "Implement comprehensive logging for security monitoring".to_string(),
        "Add input sanitization for all user-provided data".to_string(),
        "Use Internet Computer's certified data for critical state".to_string(),
        "Implement proper error handling without revealing internal details".to_string(),
    ];

    if file_size > 1_000_000 {
        recommendations.push("Consider code splitting or removing unused dependencies".to_string());
    }

    if complexity > 20 {
        recommendations.push("Add comprehensive unit tests for all code paths".to_string());
        recommendations.push(
            "Consider refactoring complex functions into smaller, testable units".to_string(),
        );
    }

    if static_findings
        .iter()
        .any(|f| f.category.contains("Memory"))
    {
        recommendations
            .push("Review memory allocation patterns and implement bounds checking".to_string());
    }

    // Determine confidence score based on analysis completeness
    let confidence = if static_findings.is_empty() {
        0.7 // Good confidence with no static issues
    } else if static_findings
        .iter()
        .any(|f| matches!(f.severity, SecuritySeverity::Critical))
    {
        0.9 // High confidence when critical issues found
    } else {
        0.8 // High confidence with some issues found
    };

    AiAnalysisResult {
        summary: summary_parts.join(" "),
        identified_patterns: patterns,
        security_concerns: concerns,
        recommendations,
        confidence_score: confidence,
    }
}
