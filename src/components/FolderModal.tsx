"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FolderPlus,
  Folder as FolderIcon,
  Code,
  Server,
  Brain,
  Palette,
  BookOpen,
  Check,
  Loader2,
} from "lucide-react";
import { FolderItem } from "@/types";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderItem[];
  defaultParentId?: string | null;
  onFolderCreated: (folder: FolderItem) => void;
}

const COLOR_PRESETS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Rose
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

const ICONS = [
  { id: "folder", label: "Folder", icon: <FolderIcon className="w-4 h-4" /> },
  { id: "code", label: "Code", icon: <Code className="w-4 h-4" /> },
  { id: "server", label: "Server", icon: <Server className="w-4 h-4" /> },
  { id: "brain", label: "AI/Brain", icon: <Brain className="w-4 h-4" /> },
  { id: "palette", label: "Design", icon: <Palette className="w-4 h-4" /> },
  { id: "book", label: "Education", icon: <BookOpen className="w-4 h-4" /> },
];

export default function FolderModal({
  isOpen,
  onClose,
  folders,
  defaultParentId,
  onFolderCreated,
}: FolderModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [icon, setIcon] = useState("folder");
  const [parentId, setParentId] = useState<string>(defaultParentId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setColor(COLOR_PRESETS[0]);
      setIcon("folder");
      setParentId(defaultParentId || "");
    }
  }, [isOpen, defaultParentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color,
          icon,
          parentId: parentId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      const created = await res.json();
      onFolderCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Folder</h2>
              <p className="text-xs text-slate-400">Organize your links like Google Drive</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Folder Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. System Design, React Tutorials, AI Research"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parent folder selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parent Folder (Optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">(None - Create as Top-Level Folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Folder Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === c ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Folder Icon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all ${
                    icon === item.id
                      ? "bg-blue-600/20 border-blue-500 text-blue-300 font-medium"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Create Folder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
