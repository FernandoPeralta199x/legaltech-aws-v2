"use client";

import { FileText, Lock, Paperclip, Trash2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/cn";

type UploadFile = {
  id: string;
  name: string;
  size: string;
  status: "waiting" | "uploading" | "done" | "error";
  progress: number;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadBox() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const added: UploadFile[] = Array.from(newFiles).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: formatFileSize(f.size),
      status: "waiting" as const,
      progress: 0
    }));
    setFiles((prev) => [...prev, ...added]);

    added.forEach((file) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "uploading", progress: 40 } : f
          )
        );
      }, 600);
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "uploading", progress: 80 } : f
          )
        );
      }, 1200);
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "done", progress: 100 } : f
          )
        );
      }, 1800);
    });
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleRemove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all cursor-pointer",
          dragging
            ? "border-brand-blue bg-brand-blue/10 shadow-glow"
            : "border-white/[0.12] bg-white/[0.02] hover:border-brand-blue/40 hover:bg-white/[0.04]"
        )}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          className="hidden"
          id="file-input"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          type="file"
        />
        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.12] transition",
            dragging ? "border-brand-blue/40 bg-brand-blue/20" : "bg-white/[0.06]"
          )}
        >
          <Upload
            className={dragging ? "text-brand-blue" : "text-slate-400"}
            size={24}
          />
        </div>
        <p className="text-sm font-semibold text-slate-200">
          Arraste documentos aqui ou{" "}
          <span className="text-brand-blue-light">clique para selecionar</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          PDF, DOCX, TXT, JPG, PNG — até 50 MB por arquivo
        </p>
        <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-brand-teal/10 border border-brand-teal/20 px-3 py-2">
          <Lock className="shrink-0 text-brand-teal" size={12} />
          <p className="text-[11px] text-slate-400">
            Os documentos serão processados em ambiente seguro e criptografado
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3"
              key={file.id}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                <FileText size={16} className="text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-200">
                  {file.name}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        file.status === "done"
                          ? "bg-brand-teal"
                          : file.status === "error"
                          ? "bg-red-500"
                          : "bg-brand-blue"
                      )}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-semibold",
                      file.status === "done"
                        ? "text-teal-400"
                        : file.status === "error"
                        ? "text-red-400"
                        : file.status === "uploading"
                        ? "text-brand-blue-light"
                        : "text-slate-400"
                    )}
                  >
                    {file.status === "waiting" && "Aguardando"}
                    {file.status === "uploading" && `${file.progress}%`}
                    {file.status === "done" && "Enviado"}
                    {file.status === "error" && "Erro"}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {file.size}
                  </span>
                </div>
              </div>
              <button
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-red-400 transition"
                onClick={() => handleRemove(file.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
