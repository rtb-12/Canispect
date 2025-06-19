import { useState, useCallback } from "react";
import { Principal } from "@dfinity/principal";

interface WasmUploadProps {
  onAnalysisComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function WasmUpload({ onAnalysisComplete, onError }: WasmUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [canisterId, setCanisterId] = useState("");
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    version: "",
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const wasmFile = droppedFiles.find(
        (file) =>
          file.name.endsWith(".wasm") || file.type === "application/wasm",
      );

      if (wasmFile) {
        setFile(wasmFile);
        if (!metadata.name) {
          setMetadata((prev) => ({
            ...prev,
            name: wasmFile.name.replace(".wasm", ""),
          }));
        }
      } else {
        onError?.("Please upload a valid WASM file (.wasm)");
      }
    },
    [metadata.name, onError],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (
          selectedFile.name.endsWith(".wasm") ||
          selectedFile.type === "application/wasm"
        ) {
          setFile(selectedFile);
          if (!metadata.name) {
            setMetadata((prev) => ({
              ...prev,
              name: selectedFile.name.replace(".wasm", ""),
            }));
          }
        } else {
          onError?.("Please upload a valid WASM file (.wasm)");
        }
      }
    },
    [metadata.name, onError],
  );

  const handleAnalyze = async () => {
    if (!file) {
      onError?.("Please select a WASM file first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert file to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const wasmBytes = new Uint8Array(arrayBuffer);

      // Prepare analysis request
      const request = {
        wasm_bytes: wasmBytes,
        canister_id: canisterId ? Principal.fromText(canisterId) : undefined,
        metadata: {
          name: metadata.name || undefined,
          description: metadata.description || undefined,
          version: metadata.version || undefined,
        },
      };

      // Import audit service here to avoid circular dependencies
      const { auditService } = await import("../services/audit");
      const result = await auditService.analyzeWasm(request);

      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      onError?.(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {file ? (
              <div>
                <p className="text-lg font-semibold text-green-600">
                  {file.name}
                </p>
                <p className="text-sm">
                  File size: {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg">Drop your WASM file here</p>
                <p className="text-sm">or click to browse</p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept=".wasm"
            onChange={handleFileInput}
            className="hidden"
            id="wasm-upload"
          />
          <label
            htmlFor="wasm-upload"
            className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Choose WASM File
          </label>
        </div>
      </div>

      {/* Metadata Form */}
      {file && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Canister Information</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Canister ID (optional)
            </label>
            <input
              type="text"
              value={canisterId}
              onChange={(e) => setCanisterId(e.target.value)}
              placeholder="e.g., rdmx6-jaaaa-aaaaa-aaadq-cai"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={metadata.name}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Canister name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={metadata.description}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the canister's functionality"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Version
            </label>
            <input
              type="text"
              value={metadata.version}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, version: e.target.value }))
              }
              placeholder="e.g., 1.0.0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full rounded-md px-6 py-3 font-semibold text-white ${
              isAnalyzing
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                <span>Analyzing WASM...</span>
              </div>
            ) : (
              "Start Security Analysis"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
