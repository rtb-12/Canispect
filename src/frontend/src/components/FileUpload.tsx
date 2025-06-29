import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.name.endsWith(".wasm")) {
          onFileUpload(file);
        } else {
          alert("Please upload a valid .wasm file");
        }
      }
    },
    [onFileUpload],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept: {
      "application/wasm": [".wasm"],
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const handleSelectFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".wasm";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-white">
          Upload WebAssembly Canister
        </h2>
        <p className="text-slate-400">
          Upload your .wasm file to begin comprehensive security analysis
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
          dropzoneActive || isDragActive
            ? "border-purple-400 bg-purple-500/10"
            : "border-slate-600 hover:border-purple-500 hover:bg-purple-500/5"
        }`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
            <Upload className="h-8 w-8 text-purple-400" />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium text-white">
              Drag & drop your .wasm file
            </h3>
            <p className="mb-4 text-slate-400">
              Or click to select from your computer
            </p>
          </div>

          <button
            type="button"
            onClick={handleSelectFile}
            className="inline-flex items-center space-x-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
          >
            <FileCode className="h-4 w-4" />
            <span>Select File</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-slate-700/30 p-4">
        <h4 className="mb-3 text-sm font-medium text-white">
          Supported Analysis:
        </h4>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <span className="text-slate-300">Static Code Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <span className="text-slate-300">Symbolic Execution</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <span className="text-slate-300">AI Security Insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
