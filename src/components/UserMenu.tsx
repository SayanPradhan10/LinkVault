"use client";

import React, { useState, useRef } from "react";
import {
  User as UserIcon,
  LogOut,
  Download,
  Upload,
  LogIn,
  Shield,
  Check,
  Loader2,
} from "lucide-react";
import { UserProfile } from "@/types";

interface UserMenuProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onImportSuccess: () => void;
}

export default function UserMenu({
  user,
  onOpenAuth,
  onLogout,
  onImportSuccess,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    setIsOpen(false);
    window.location.href = "/api/vault/export";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch("/api/vault/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Import failed");

      alert(result.message || "Vault imported successfully!");
      onImportSuccess();
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
      setIsOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "G";

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-all text-xs font-medium"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {initial}
        </div>
        <span className="max-w-[100px] truncate hidden sm:inline">
          {user ? user.name || user.email.split("@")[0] : "Guest Mode"}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            {/* User Identity Info */}
            <div className="px-3 py-2 border-b border-slate-800 mb-1">
              <p className="text-xs font-semibold text-white truncate">
                {user ? user.name || "Logged In User" : "Local / Guest Vault"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user ? user.email : "Data stored locally"}
              </p>
            </div>

            {/* Backup & Restore items */}
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Vault (JSON)</span>
            </button>

            <button
              type="button"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isImporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Import Vault (JSON)</span>
            </button>

            <div className="border-t border-slate-800 my-1" />

            {/* Auth Action */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10 rounded-xl font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
