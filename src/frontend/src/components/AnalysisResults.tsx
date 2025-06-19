import { SecurityAnalysisResult } from "../services/audit";

interface AnalysisResultsProps {
  result: SecurityAnalysisResult;
  onSaveToRegistry?: () => void;
}

export function AnalysisResults({
  result,
  onSaveToRegistry,
}: AnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "high":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Security Analysis Results
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              WASM Hash: {result.wasm_hash}
            </p>
          </div>
          <div
            className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium ${getSeverityColor(result.overall_severity)}`}
          >
            {getSeverityIcon(result.overall_severity)}
            <span className="ml-2">
              {result.overall_severity.toUpperCase()}
            </span>
          </div>
        </div>

        {onSaveToRegistry && (
          <button
            onClick={onSaveToRegistry}
            className="mt-4 inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Save to Audit Registry
          </button>
        )}
      </div>

      {/* Code Metrics */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Code Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(result.static_analysis.metrics.file_size_bytes / 1024).toFixed(
                1,
              )}
              KB
            </div>
            <div className="text-sm text-gray-600">File Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {result.static_analysis.metrics.estimated_lines_of_code}
            </div>
            <div className="text-sm text-gray-600">Lines of Code</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {result.static_analysis.metrics.function_count}
            </div>
            <div className="text-sm text-gray-600">Functions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {result.static_analysis.metrics.complexity_score}
            </div>
            <div className="text-sm text-gray-600">Complexity</div>
          </div>
        </div>
      </div>

      {/* Static Analysis Results */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Static Analysis
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Tools: {result.static_analysis.tools_used.join(", ")}
          </p>
        </div>

        {result.static_analysis.vulnerabilities_found.length > 0 ? (
          <div className="space-y-4">
            {result.static_analysis.vulnerabilities_found.map(
              (finding, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(finding.severity)}`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {finding.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {finding.message}
                      </p>
                      {finding.location && (
                        <p className="mt-1 text-xs text-gray-500">
                          Location: {finding.location}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {finding.tool}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              No static analysis issues found
            </p>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <svg
            className="mr-2 h-5 w-5 text-purple-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
          AI Security Analysis
          <span className="ml-2 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
            {(result.ai_analysis.confidence_score * 100).toFixed(0)}% confidence
          </span>
        </h3>

        <div className="space-y-6">
          {/* AI Summary */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">
              Summary
            </h4>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {result.ai_analysis.summary}
              </p>
            </div>
          </div>

          {/* Identified Patterns */}
          {result.ai_analysis.identified_patterns.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Identified Patterns
              </h4>
              <ul className="space-y-2">
                {result.ai_analysis.identified_patterns.map(
                  (pattern, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="mt-0.5 mr-2 h-4 w-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{pattern}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Security Concerns */}
          {result.ai_analysis.security_concerns.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Security Concerns
              </h4>
              <ul className="space-y-2">
                {result.ai_analysis.security_concerns.map((concern, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="mt-0.5 mr-2 h-4 w-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.ai_analysis.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {result.ai_analysis.recommendations.map(
                  (recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="mt-0.5 mr-2 h-4 w-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
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

      {/* Overall Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-900">
            Overall Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="mt-0.5 mr-2 h-4 w-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-blue-800">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
