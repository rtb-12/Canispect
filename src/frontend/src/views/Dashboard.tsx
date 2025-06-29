import { useState } from "react";
import {
  FileCode,
  Download,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";
import { useAuth } from "../services/auth";
import { WasmUpload } from "../components/WasmUpload";
import { AnalysisResults } from "../components/AnalysisResults";
import { SecurityAnalysisResult } from "../services/audit";

interface AnalysisState {
  status: "idle" | "analyzing" | "complete" | "error";
  results?: SecurityAnalysisResult;
  error?: string;
}

const Dashboard = () => {
  const authState = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisState>({
    status: "idle",
  });

  const handleAnalysisComplete = (result: SecurityAnalysisResult) => {
    setAnalysis({
      status: "complete",
      results: result,
    });
  };

  const handleAnalysisError = (error: string) => {
    setAnalysis({
      status: "error",
      error: error,
    });
  };

  const resetAnalysis = () => {
    setAnalysis({ status: "idle" });
  };

  const recentAudits = [
    {
      id: "1",
      name: "token-canister.wasm",
      timestamp: "2 hours ago",
      status: "complete",
      severity: "low",
      score: 8.9,
    },
    {
      id: "2",
      name: "nft-marketplace.wasm",
      timestamp: "1 day ago",
      status: "complete",
      severity: "high",
      score: 4.2,
    },
    {
      id: "3",
      name: "defi-protocol.wasm",
      timestamp: "3 days ago",
      status: "complete",
      severity: "medium",
      score: 6.7,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-purple-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">
            Authentication Required
          </h2>
          <p className="text-slate-400">
            Please connect with Internet Identity to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Security Dashboard
          </h1>
          <p className="text-slate-400">
            Upload and analyze your WebAssembly canisters for security
            vulnerabilities
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Analysis Panel */}
          <div className="space-y-6 lg:col-span-2">
            {analysis.status === "idle" && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
                <WasmUpload
                  onAnalysisComplete={handleAnalysisComplete}
                  onError={handleAnalysisError}
                />
              </div>
            )}

            {analysis.status === "analyzing" && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
                <div className="space-y-4 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                  <h3 className="text-lg font-semibold text-white">
                    Analyzing WASM file...
                  </h3>
                  <p className="text-slate-400">
                    Please wait while we perform security analysis
                  </p>
                </div>
              </div>
            )}

            {analysis.status === "complete" && analysis.results && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Analysis Complete
                  </h2>
                  <button
                    onClick={resetAnalysis}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                  >
                    Analyze Another File
                  </button>
                </div>
                <AnalysisResults result={analysis.results} />
              </div>
            )}

            {analysis.status === "error" && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Analysis Failed
                  </h3>
                  <p className="text-red-400">{analysis.error}</p>
                  <button
                    onClick={resetAnalysis}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Audits</span>
                  <span className="font-medium text-white">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Critical Issues</span>
                  <span className="font-medium text-red-400">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Avg. Score</span>
                  <span className="font-medium text-green-400">8.2/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Audit</span>
                  <span className="font-medium text-slate-300">2h ago</span>
                </div>
              </div>
            </div>

            {/* Recent Audits */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Recent Audits
                </h3>
                <History className="h-5 w-5 text-purple-400" />
              </div>
              <div className="space-y-3">
                {recentAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="cursor-pointer rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-white">
                        {audit.name}
                      </span>
                      <div
                        className={`flex items-center space-x-1 rounded-md border px-2 py-1 text-xs ${getSeverityColor(audit.severity)}`}
                      >
                        {getSeverityIcon(audit.severity)}
                        <span className="capitalize">{audit.severity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {audit.timestamp}
                      </span>
                      <span className="text-sm font-medium text-purple-400">
                        {audit.score}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="flex w-full items-center space-x-3 rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-left text-white transition-colors hover:bg-slate-700">
                  <History className="h-4 w-4" />
                  <span>View All Audits</span>
                </button>
                <button className="flex w-full items-center space-x-3 rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-left text-white transition-colors hover:bg-slate-700">
                  <Download className="h-4 w-4" />
                  <span>Export Reports</span>
                </button>
                <button className="flex w-full items-center space-x-3 rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-left text-white transition-colors hover:bg-slate-700">
                  <FileCode className="h-4 w-4" />
                  <span>API Documentation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
