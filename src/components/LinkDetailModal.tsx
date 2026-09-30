"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Star,
  Trash2,
  Folder as FolderIcon,
  Copy,
  Check,
  FileText,
  Calendar,
  Save,
  Loader2,
  Globe,
  Share2,
} from "lucide-react";
import { LinkItem, FolderItem } from "@/types";
import { extractYouTubeVideoId } from "@/lib/metadata";
import { getPlatformBadge } from "./LinkCard";
import { format } from "date-fns";

interface LinkDetailModalProps {
  link: LinkItem | null;
  folders: FolderItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateLink: (updatedLink: LinkItem) => void;
  onDeleteLink: (id: string, title: string) => void;
}

export default function LinkDetailModal({
  link,
  folders,
  isOpen,
  onClose,
  onUpdateLink,
  onDeleteLink,
}: LinkDetailModalProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title || "");
      setNotes(link.notes || "");
      setFolderId(link.folderId || "");
      setIsFavorite(link.isFavorite || false);
      setCopied(false);
    }
  }, [link]);

  if (!isOpen || !link) return null;

  const badge = getPlatformBadge(link.platform);
  const youtubeVideoId =
    link.platform === "youtube" ? extractYouTubeVideoId(link.url) : null;
  const createdDate = new Date(link.createdAt);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          folderId: folderId || null,
          isFavorite,
        }),
      });

      if (!res.ok) throw new Error("Failed to update link");

      const updated = await res.json();
      onUpdateLink(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving updates");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.name}</span>
            </span>

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Saved on {format(createdDate, "MMM d, yyyy • h:mm a")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
              title={isFavorite ? "Unstar" : "Star"}
            >
              <Star
                className={`w-4 h-4 ${isFavorite ? "fill-amber-400" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title="Open original website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* YouTube In-App Player OR Cover Banner */}
          {youtubeVideoId ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0`}
                title={link.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : link.imageUrl ? (
            <div className="relative aspect-video max-h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={link.imageUrl}
                alt={link.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {/* Editable Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* URL & Source Info */}
          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-mono">
                Original Destination
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline truncate block"
              >
                {link.url}
              </a>
            </div>
            {link.author && (
              <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex-shrink-0">
                Author: {link.author}
              </span>
            )}
          </div>

          {/* Description */}
          {link.description && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Extracted Summary
              </label>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                {link.description}
              </p>
            </div>
          )}

          {/* Target Folder Reassignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Organized Under Folder
            </label>
            <div className="relative">
              <FolderIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">(No folder - Keep in Inbox)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personal Notes / Study Takeaways */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Personal Notes & Study Insights</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down why this link is valuable, important quotes, timestamps, or action items..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDeleteLink(link.id, link.title);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Link</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
