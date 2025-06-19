import { backend } from "../../../declarations/backend";
import { audit_registry } from "../../../declarations/audit_registry";
import type {
  SecurityAnalysisResult,
  WasmAnalysisRequest,
} from "../../../declarations/backend/backend.did";
import type {
  AuditRecord,
  AuditSummary,
  AuditRequest,
} from "../../../declarations/audit_registry/audit_registry.did";
import { authService } from "./auth";
import { Principal } from "@dfinity/principal";

export interface CanispectService {
  analyzeWasm: (
    wasmFile: File,
    metadata?: any,
  ) => Promise<SecurityAnalysisResult>;
  submitAuditRequest: (
    wasmBytes: Uint8Array,
    canisterId?: string,
  ) => Promise<string>;
  getAuditRecord: (auditId: string) => Promise<AuditRecord | null>;
  getMyAudits: () => Promise<AuditSummary[]>;
  getAuditStatistics: () => Promise<{
    total: bigint;
    completed: bigint;
    critical: bigint;
    high: bigint;
  }>;
}

class CanispectServiceImpl implements CanispectService {
  async analyzeWasm(
    wasmFile: File,
    metadata?: any,
  ): Promise<SecurityAnalysisResult> {
    try {
      const wasmBytes = await this.fileToUint8Array(wasmFile);

      const request: WasmAnalysisRequest = {
        wasm_bytes: Array.from(wasmBytes),
        canister_id: metadata?.canisterId ? [metadata.canisterId] : [],
        metadata: metadata
          ? [
              {
                name: metadata.name ? [metadata.name] : [],
                description: metadata.description ? [metadata.description] : [],
                version: metadata.version ? [metadata.version] : [],
              },
            ]
          : [],
      };

      const result = await backend.analyze_wasm_security(request);
      return result;
    } catch (error) {
      console.error("Failed to analyze WASM:", error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  async submitAuditRequest(
    wasmBytes: Uint8Array,
    canisterId?: string,
  ): Promise<string> {
    try {
      const authState = authService.getAuthState();
      if (!authState.isAuthenticated) {
        throw new Error("Please login to submit audit requests");
      }

      const request: AuditRequest = {
        canister_id: canisterId ? [Principal.fromText(canisterId)] : [],
        wasm_bytes: Array.from(wasmBytes),
        metadata: [],
      };

      const auditId = await audit_registry.submit_audit_request(request);
      return auditId;
    } catch (error) {
      console.error("Failed to submit audit request:", error);
      throw new Error(`Failed to submit audit: ${error}`);
    }
  }

  async getAuditRecord(auditId: string): Promise<AuditRecord | null> {
    try {
      const result = await audit_registry.get_audit_record(auditId);
      return result.length > 0 ? result[0] || null : null;
    } catch (error) {
      console.error("Failed to get audit record:", error);
      return null;
    }
  }

  async getMyAudits(): Promise<AuditSummary[]> {
    try {
      const authState = authService.getAuthState();
      if (!authState.isAuthenticated || !authState.principal) {
        return [];
      }

      const audits = await audit_registry.list_audits_by_auditor(
        authState.principal,
      );
      return audits;
    } catch (error) {
      console.error("Failed to get my audits:", error);
      return [];
    }
  }

  async getAuditStatistics(): Promise<{
    total: bigint;
    completed: bigint;
    critical: bigint;
    high: bigint;
  }> {
    try {
      const stats = await audit_registry.get_audit_statistics();
      return {
        total: stats[0],
        completed: stats[1],
        critical: stats[2],
        high: stats[3],
      };
    } catch (error) {
      console.error("Failed to get audit statistics:", error);
      return {
        total: BigInt(0),
        completed: BigInt(0),
        critical: BigInt(0),
        high: BigInt(0),
      };
    }
  }

  private async fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }
}

export const canispectService = new CanispectServiceImpl();
