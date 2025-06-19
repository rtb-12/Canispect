import { useState } from "react";
import { AuthButton } from "./components/AuthButton";
import { WasmUpload } from "./components/WasmUpload";
import { AnalysisResults } from "./components/AnalysisResults";
import { AuditHistory } from "./components/AuditHistory";
import { SecurityAnalysisResult } from "./services/audit";
import { AuthState } from "./services/auth";

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    identity: null,
    principal: null,
  });
  const [analysisResult, setAnalysisResult] =
    useState<SecurityAnalysisResult | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");

  const handleAnalysisComplete = (result: SecurityAnalysisResult) => {
    setAnalysisResult(result);
    setError(undefined);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAnalysisResult(null);
  };

  const handleSaveToRegistry = async () => {
    if (!analysisResult) return;

    try {
      const { auditService } = await import("./services/audit");
      const auditId = await auditService.submitAuditRecord(analysisResult);
      alert(`Audit saved to registry with ID: ${auditId}`);
    } catch (error) {
      console.error("Failed to save to registry:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save to registry",
      );
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Canispect</h1>
                  <p className="text-xs text-gray-600">
                    AI-Powered Canister Auditor
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="ml-8 hidden space-x-8 md:flex">
                <button
                  onClick={() => setActiveTab("analyze")}
                  className={`border-b-2 px-3 py-2 text-sm font-medium ${
                    activeTab === "analyze"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Analyze WASM
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`border-b-2 px-3 py-2 text-sm font-medium ${
                    activeTab === "history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Audit History
                </button>
              </nav>
            </div>

            <AuthButton onAuthChange={setAuthState} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(undefined)}
                className="-mx-1.5 -my-1.5 ml-auto rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "analyze" && (
          <div className="space-y-8">
            {/* Hero Section */}
            {!analysisResult && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  AI-Powered Security Analysis
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                  Upload your canister WASM file for comprehensive security
                  analysis using static analysis tools and AI-powered insights.
                </p>
              </div>
            )}

            {/* Analysis Interface */}
            {!analysisResult ? (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <WasmUpload
                  onAnalysisComplete={handleAnalysisComplete}
                  onError={handleError}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Analysis Complete
                  </h2>
                  <button
                    onClick={resetAnalysis}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Analyze Another File
                  </button>
                </div>
                <AnalysisResults
                  result={analysisResult}
                  onSaveToRegistry={
                    authState.isAuthenticated ? handleSaveToRegistry : undefined
                  }
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && <AuditHistory />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Canispect - AI-Powered Canister Security Auditing for Internet
              Computer
            </p>
            <p className="mt-1">Built with ❤️ for the ICP ecosystem</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
