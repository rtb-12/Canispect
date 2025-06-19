import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { authService } from "./auth";

// Import the canister declarations
import {
  createActor as createBackendActor,
  canisterId as backendCanisterId,
} from "../../../declarations/backend";
import {
  createActor as createAuditRegistryActor,
  canisterId as auditRegistryCanisterId,
} from "../../../declarations/audit_registry";

export interface WasmAnalysisRequest {
  wasm_bytes: Uint8Array;
  canister_id?: Principal;
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
  };
}

export interface SecurityAnalysisResult {
  wasm_hash: string;
  static_analysis: {
    tools_used: string[];
    vulnerabilities_found: Array<{
      tool: string;
      severity: string;
      category: string;
      message: string;
      location?: string;
    }>;
    metrics: {
      file_size_bytes: number;
      estimated_lines_of_code: number;
      function_count: number;
      complexity_score: number;
    };
  };
  ai_analysis: {
    summary: string;
    identified_patterns: string[];
    security_concerns: string[];
    recommendations: string[];
    confidence_score: number;
  };
  overall_severity: string;
  recommendations: string[];
  analysis_timestamp: bigint;
}

export interface AuditRecord {
  id: string;
  canister_id?: Principal;
  wasm_hash: string;
  audit_timestamp: bigint;
  auditor: Principal;
  severity: string;
  findings: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    recommendation: string;
    location?: string;
  }>;
  ai_summary: string;
  status: string;
  metadata: {
    tools_used: string[];
    analysis_duration_ms: bigint;
    lines_of_code?: number;
    file_size_bytes: number;
  };
}

export interface AuditSummary {
  id: string;
  canister_id?: Principal;
  wasm_hash: string;
  audit_timestamp: bigint;
  auditor: Principal;
  severity: string;
  findings_count: number;
  status: string;
}

class AuditService {
  private getBackendActor() {
    const authState = authService.getAuthState();

    // Create agent with the authenticated identity if available
    const agent = new HttpAgent({
      identity: authState.identity || undefined,
      host:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4943"
          : "https://ic0.app",
    });

    // In development, fetch root key
    if (process.env.NODE_ENV === "development") {
      agent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key for agent. Check to ensure that your local replica is running",
        );
        console.error(err);
      });
    }

    return createBackendActor(backendCanisterId, { agent });
  }

  private getAuditRegistryActor(requireAuth: boolean = false) {
    const authState = authService.getAuthState();

    if (requireAuth && (!authState.isAuthenticated || !authState.identity)) {
      throw new Error("User must be authenticated");
    }

    // Create agent with the authenticated identity if available
    const agent = new HttpAgent({
      identity: authState.identity || undefined,
      host:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4943"
          : "https://ic0.app",
    });

    // In development, fetch root key
    if (process.env.NODE_ENV === "development") {
      agent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key for agent. Check to ensure that your local replica is running",
        );
        console.error(err);
      });
    }

    return createAuditRegistryActor(auditRegistryCanisterId, { agent });
  }

  async analyzeWasm(
    request: WasmAnalysisRequest,
  ): Promise<SecurityAnalysisResult> {
    try {
      // Convert Uint8Array to Array for Candid
      const wasmArray = Array.from(request.wasm_bytes);

      const analysisRequest: any = {
        wasm_bytes: wasmArray,
        canister_id: request.canister_id ? [request.canister_id] : [],
        metadata: request.metadata
          ? [
              {
                name: request.metadata.name ? [request.metadata.name] : [],
                description: request.metadata.description
                  ? [request.metadata.description]
                  : [],
                version: request.metadata.version
                  ? [request.metadata.version]
                  : [],
              },
            ]
          : [],
      };

      const backendActor = this.getBackendActor();
      const result = await backendActor.analyze_wasm_security(analysisRequest);
      return result as unknown as SecurityAnalysisResult;
    } catch (error) {
      console.error("Failed to analyze WASM:", error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  async submitAuditRecord(
    analysisResult: SecurityAnalysisResult,
    canisterId?: Principal,
  ): Promise<string> {
    try {
      const authenticatedRegistry = this.getAuditRegistryActor(true);

      const auditRequest: any = {
        canister_id: canisterId ? [canisterId] : [],
        wasm_bytes: [], // We already have the hash, no need to store bytes again
        metadata: [
          {
            tools_used: analysisResult.static_analysis.tools_used,
            analysis_duration_ms: BigInt(1000), // Mock duration
            lines_of_code: [
              analysisResult.static_analysis.metrics.estimated_lines_of_code,
            ],
            file_size_bytes:
              analysisResult.static_analysis.metrics.file_size_bytes,
          },
        ],
      };

      const auditId =
        await authenticatedRegistry.submit_audit_request(auditRequest);
      return auditId as string;
    } catch (error) {
      console.error("Failed to submit audit record:", error);
      throw new Error(`Failed to submit audit: ${error}`);
    }
  }

  async getAuditHistory(canisterId?: Principal): Promise<AuditSummary[]> {
    try {
      const registryActor = this.getAuditRegistryActor(false);

      if (canisterId) {
        const result = await registryActor.list_audits_by_canister(canisterId);
        return result as unknown as AuditSummary[];
      } else {
        // For now, return empty array since there's no "get recent audits" method
        // In the future, we could add pagination or a different method
        return [];
      }
    } catch (error) {
      console.error("Failed to get audit history:", error);
      throw new Error(`Failed to get audit history: ${error}`);
    }
  }

  async getAuditRecord(auditId: string): Promise<AuditRecord | null> {
    try {
      const registryActor = this.getAuditRegistryActor(false);
      const result = await registryActor.get_audit_record(auditId);
      return (result as any[])[0] || null;
    } catch (error) {
      console.error("Failed to get audit record:", error);
      throw new Error(`Failed to get audit record: ${error}`);
    }
  }

  async getMyAudits(): Promise<AuditSummary[]> {
    try {
      const authState = authService.getAuthState();
      if (!authState.isAuthenticated || !authState.principal) {
        return [];
      }

      const authenticatedRegistry = this.getAuditRegistryActor(true);
      const result = await authenticatedRegistry.list_audits_by_auditor(
        authState.principal,
      );
      return result as unknown as AuditSummary[];
    } catch (error) {
      console.error("Failed to get my audits:", error);
      throw new Error(`Failed to get my audits: ${error}`);
    }
  }
}

export const auditService = new AuditService();
