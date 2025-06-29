import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Share,
} from "lucide-react";
import { SecurityAnalysisResult } from "../services/audit";

interface AuditResultsProps {
  result: SecurityAnalysisResult;
}

const AuditResults: React.FC<AuditResultsProps> = ({ result }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5" />;
      case "high":
      case "critical":
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Security Analysis Results
          </h2>
          <p className="text-slate-400">
            Analysis completed at{" "}
            {new Date(Number(result.analysis_timestamp)).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
          <button className="inline-flex items-center space-x-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-600">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Overall Severity */}
      <div className="rounded-lg bg-slate-700/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Overall Assessment
            </h3>
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 rounded-md border px-3 py-1 text-sm ${getSeverityColor(result.overall_severity)}`}
              >
                {getSeverityIcon(result.overall_severity)}
                <span className="font-medium capitalize">
                  {result.overall_severity} Risk
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="mb-1 text-sm text-slate-400">WASM Hash</p>
            <p className="font-mono text-sm text-white">{result.wasm_hash}</p>
          </div>
        </div>
      </div>

      {/* Analysis Results Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Static Analysis */}
        <div className="rounded-lg bg-slate-700/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Static Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tools Used</span>
              <span className="text-slate-300">
                {result.static_analysis.tools_used.join(", ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vulnerabilities Found</span>
              <span className="font-medium text-red-400">
                {result.static_analysis.vulnerabilities_found.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Functions</span>
              <span className="font-medium text-blue-400">
                {result.static_analysis.metrics.function_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Complexity Score</span>
              <span className="font-medium text-yellow-400">
                {result.static_analysis.metrics.complexity_score.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">File Size</span>
              <span className="font-medium text-slate-300">
                {(
                  result.static_analysis.metrics.file_size_bytes / 1024
                ).toFixed(1)}{" "}
                KB
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="rounded-lg bg-slate-700/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">AI Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Confidence Score</span>
              <span
                className={`font-medium ${getConfidenceColor(result.ai_analysis.confidence_score)}`}
              >
                {(result.ai_analysis.confidence_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Patterns Identified</span>
              <span className="font-medium text-blue-400">
                {result.ai_analysis.identified_patterns.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security Concerns</span>
              <span className="font-medium text-orange-400">
                {result.ai_analysis.security_concerns.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recommendations</span>
              <span className="font-medium text-green-400">
                {result.ai_analysis.recommendations.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerabilities */}
      {result.static_analysis.vulnerabilities_found.length > 0 && (
        <div className="rounded-lg bg-slate-700/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Found Vulnerabilities
          </h3>
          <div className="space-y-3">
            {result.static_analysis.vulnerabilities_found.map((vuln, index) => (
              <div key={index} className="rounded-lg bg-slate-800/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`rounded px-2 py-1 text-xs ${getSeverityColor(vuln.severity)}`}
                    >
                      {vuln.severity.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {vuln.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{vuln.tool}</span>
                </div>
                <p className="text-sm text-slate-300">{vuln.message}</p>
                {vuln.location && (
                  <p className="mt-1 text-xs text-slate-400">
                    Location: {vuln.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="rounded-lg bg-slate-700/30 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          AI Security Insights
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-slate-300">Summary</h4>
            <p className="leading-relaxed text-slate-400">
              {result.ai_analysis.summary}
            </p>
          </div>

          {result.ai_analysis.identified_patterns.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">
                Identified Patterns
              </h4>
              <ul className="space-y-1">
                {result.ai_analysis.identified_patterns.map(
                  (pattern, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></div>
                      <span className="text-sm text-slate-400">{pattern}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {result.ai_analysis.security_concerns.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">
                Security Concerns
              </h4>
              <ul className="space-y-1">
                {result.ai_analysis.security_concerns.map((concern, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400"></div>
                    <span className="text-sm text-slate-400">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.ai_analysis.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">
                Recommendations
              </h4>
              <ul className="space-y-1">
                {result.ai_analysis.recommendations.map(
                  (recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400"></div>
                      <span className="text-sm text-slate-400">
                        {recommendation}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AuditResults;
