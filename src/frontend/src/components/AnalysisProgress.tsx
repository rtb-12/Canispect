import React from "react";
import { motion } from "framer-motion";
import { Loader, FileCode, Search, Brain } from "lucide-react";

interface AnalysisProgressProps {
  status: "uploading" | "analyzing";
  progress: number;
  fileName?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  status,
  progress,
  fileName,
}) => {
  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return "Uploading file...";
      case "analyzing":
        return "Analyzing security vulnerabilities...";
      default:
        return "Processing...";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "uploading":
        return <FileCode className="h-6 w-6" />;
      case "analyzing":
        return <Brain className="h-6 w-6" />;
      default:
        return <Loader className="h-6 w-6" />;
    }
  };

  const analysisSteps = [
    {
      name: "Static Analysis",
      icon: Search,
      active: status === "analyzing" && progress > 20,
    },
    {
      name: "Symbolic Execution",
      icon: Brain,
      active: status === "analyzing" && progress > 50,
    },
    {
      name: "AI Insights",
      icon: Brain,
      active: status === "analyzing" && progress > 80,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20"
        >
          {getIcon()}
        </motion.div>

        <h2 className="mb-2 text-xl font-semibold text-white">
          {getStatusText()}
        </h2>
        {fileName && <p className="text-slate-400">Processing: {fileName}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Progress</span>
          <span className="text-sm font-medium text-purple-400">
            {progress}%
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-700">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {status === "analyzing" && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Analysis Steps:</h3>
          <div className="space-y-2">
            {analysisSteps.map((step) => (
              <div key={step.name} className="flex items-center space-x-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.active
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-slate-700 text-slate-500"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm ${
                    step.active ? "font-medium text-white" : "text-slate-400"
                  }`}
                >
                  {step.name}
                </span>
                {step.active && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-purple-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisProgress;
