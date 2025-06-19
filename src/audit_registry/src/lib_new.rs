use ic_cdk::export_candid;
use ic_cdk::{
    caller,
    export::candid::{CandidType, Deserialize, Principal},
    init, post_upgrade, pre_upgrade, query, update,
};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AuditRecord {
    pub id: String,
    pub canister_id: Option<Principal>,
    pub wasm_hash: String,
    pub audit_timestamp: u64,
    pub auditor: Principal,
    pub severity: AuditSeverity,
    pub findings: Vec<SecurityFinding>,
    pub ai_summary: String,
    pub status: AuditStatus,
    pub metadata: AuditMetadata,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SecurityFinding {
    pub id: String,
    pub severity: FindingSeverity,
    pub category: SecurityCategory,
    pub title: String,
    pub description: String,
    pub recommendation: String,
    pub location: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum AuditSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum FindingSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum SecurityCategory {
    Reentrancy,
    UnauthorizedAccess,
    CycleExhaustion,
    MemoryLeak,
    IntegerOverflow,
    DataValidation,
    AccessControl,
    Other,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum AuditStatus {
    InProgress,
    Completed,
    Failed,
    RequiresReview,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AuditMetadata {
    pub tools_used: Vec<String>,
    pub analysis_duration_ms: u64,
    pub lines_of_code: Option<u32>,
    pub file_size_bytes: u32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AuditRequest {
    pub canister_id: Option<Principal>,
    pub wasm_bytes: Vec<u8>,
    pub metadata: Option<AuditMetadata>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AuditSummary {
    pub id: String,
    pub canister_id: Option<Principal>,
    pub wasm_hash: String,
    pub audit_timestamp: u64,
    pub auditor: Principal,
    pub severity: AuditSeverity,
    pub findings_count: u32,
    pub status: AuditStatus,
}

thread_local! {
    static AUDIT_STORAGE: RefCell<HashMap<String, AuditRecord>> = RefCell::new(HashMap::new());
}

fn generate_audit_id() -> String {
    let timestamp = ic_cdk::api::time();
    let caller = caller();
    let combined = format!("{}-{}", timestamp, caller.to_text());
    let mut hasher = Sha256::new();
    hasher.update(combined.as_bytes());
    let hash = hasher.finalize();
    format!("{:x}", hash)[..16].to_string()
}

fn hash_wasm_bytes(wasm_bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(wasm_bytes);
    let hash = hasher.finalize();
    format!("{:x}", hash)
}

#[update]
pub fn submit_audit_request(request: AuditRequest) -> String {
    let audit_id = generate_audit_id();
    let wasm_hash = hash_wasm_bytes(&request.wasm_bytes);
    let auditor = caller();
    let timestamp = ic_cdk::api::time();

    // Create initial audit record
    let audit_record = AuditRecord {
        id: audit_id.clone(),
        canister_id: request.canister_id,
        wasm_hash,
        audit_timestamp: timestamp,
        auditor,
        severity: AuditSeverity::Info,
        findings: vec![],
        ai_summary: "Audit in progress...".to_string(),
        status: AuditStatus::InProgress,
        metadata: request.metadata.unwrap_or(AuditMetadata {
            tools_used: vec!["AI Analysis".to_string()],
            analysis_duration_ms: 0,
            lines_of_code: None,
            file_size_bytes: request.wasm_bytes.len() as u32,
        }),
    };

    AUDIT_STORAGE.with(|storage| {
        storage.borrow_mut().insert(audit_id.clone(), audit_record);
    });

    audit_id
}

#[update]
pub fn update_audit_record(
    audit_id: String,
    findings: Vec<SecurityFinding>,
    ai_summary: String,
    severity: AuditSeverity,
) -> bool {
    AUDIT_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        if let Some(mut record) = storage.get(&audit_id).cloned() {
            record.findings = findings;
            record.ai_summary = ai_summary;
            record.severity = severity;
            record.status = AuditStatus::Completed;
            storage.insert(audit_id, record);
            true
        } else {
            false
        }
    })
}

#[query]
pub fn get_audit_record(audit_id: String) -> Option<AuditRecord> {
    AUDIT_STORAGE.with(|storage| storage.borrow().get(&audit_id).cloned())
}

#[query]
pub fn get_audit_summary(audit_id: String) -> Option<AuditSummary> {
    AUDIT_STORAGE.with(|storage| {
        storage.borrow().get(&audit_id).map(|record| AuditSummary {
            id: record.id.clone(),
            canister_id: record.canister_id,
            wasm_hash: record.wasm_hash.clone(),
            audit_timestamp: record.audit_timestamp,
            auditor: record.auditor,
            severity: record.severity.clone(),
            findings_count: record.findings.len() as u32,
            status: record.status.clone(),
        })
    })
}

#[query]
pub fn list_audits_by_auditor(auditor: Principal) -> Vec<AuditSummary> {
    AUDIT_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, record)| record.auditor == auditor)
            .map(|(_, record)| AuditSummary {
                id: record.id.clone(),
                canister_id: record.canister_id,
                wasm_hash: record.wasm_hash.clone(),
                audit_timestamp: record.audit_timestamp,
                auditor: record.auditor,
                severity: record.severity.clone(),
                findings_count: record.findings.len() as u32,
                status: record.status.clone(),
            })
            .collect()
    })
}

#[query]
pub fn list_audits_by_canister(canister_id: Principal) -> Vec<AuditSummary> {
    AUDIT_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, record)| record.canister_id == Some(canister_id))
            .map(|(_, record)| AuditSummary {
                id: record.id.clone(),
                canister_id: record.canister_id,
                wasm_hash: record.wasm_hash.clone(),
                audit_timestamp: record.audit_timestamp,
                auditor: record.auditor,
                severity: record.severity.clone(),
                findings_count: record.findings.len() as u32,
                status: record.status.clone(),
            })
            .collect()
    })
}

#[query]
pub fn get_audit_statistics() -> (u64, u64, u64, u64) {
    AUDIT_STORAGE.with(|storage| {
        let storage = storage.borrow();
        let total = storage.len() as u64;
        let completed = storage
            .iter()
            .filter(|(_, record)| matches!(record.status, AuditStatus::Completed))
            .count() as u64;
        let critical = storage
            .iter()
            .filter(|(_, record)| matches!(record.severity, AuditSeverity::Critical))
            .count() as u64;
        let high = storage
            .iter()
            .filter(|(_, record)| matches!(record.severity, AuditSeverity::High))
            .count() as u64;

        (total, completed, critical, high)
    })
}

#[init]
fn init() {
    // Initialize the canister
}

#[pre_upgrade]
fn pre_upgrade() {
    // For simple HashMap storage, we'll implement this later
}

#[post_upgrade]
fn post_upgrade() {
    // For simple HashMap storage, we'll implement this later
}

export_candid!();
