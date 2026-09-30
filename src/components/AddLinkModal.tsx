"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Link as LinkIcon,
  Folder as FolderIcon,
  Sparkles,
  Loader2,
  FileText,
  Star,
  Check,
  Tag as TagIcon,
  Globe,
} from "lucide-react";
import { FolderItem, LinkItem, PlatformType } from "@/types";
import { getPlatformBadge } from "./LinkCard";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderItem[];
  defaultFolderId: string | null;
  onLinkAdded: (newLink: LinkItem) => void;
}

export default function AddLinkModal({
  isOpen,
  onClose,
  folders,
  defaultFolderId,
  onLinkAdded,
}: AddLinkModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [platform, setPlatform] = useState<PlatformType>("web");
  const [folderId, setFolderId] = useState<string>(defaultFolderId || "");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  // Sync default folder
  useEffect(() => {
    if (defaultFolderId) {
      setFolderId(defaultFolderId);
    }
  }, [defaultFolderId]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setPlatform("web");
      setNotes("");
      setTagsInput("");
      setIsFavorite(false);
      setScrapeError("");
      setIsScraping(false);
    }
  }, [isOpen]);

  const handleFetchMetadata = async (targetUrl: string) => {
    if (!targetUrl || !targetUrl.includes(".")) return;
    setIsScraping(true);
    setScrapeError("");

    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) throw new Error("Could not extract metadata");

      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.platform) setPlatform(data.platform);
    } catch (err: any) {
      console.warn("Fetch metadata error:", err);
      setScrapeError("Couldn't auto-fetch metadata. You can enter details manually.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !title) {
      handleFetchMetadata(url.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || url.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          platform,
          folderId: folderId || null,
          notes: notes.trim() || null,
          isFavorite,
          tags,
        }),
      });

      if (!res.ok) throw new Error("Failed to save link");

      const created = await res.json();
      onLinkAdded(created);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const badge = getPlatformBadge(platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Save Link to Vault</h2>
              <p className="text-xs text-slate-400">Add YouTube, Instagram, post, or article</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* URL Input with Auto Scrape Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Link URL *
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://youtube.com/..., https://instagram.com/..., etc."
                className="w-full pl-3.5 pr-28 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => handleFetchMetadata(url.trim())}
                disabled={isScraping || !url.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-medium rounded-lg disabled:opacity-40 transition-colors"
              >
                {isScraping ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Auto-Fetch</span>
              </button>
            </div>
            {scrapeError && (
              <p className="text-xs text-amber-400/90 mt-1">{scrapeError}</p>
            )}
          </div>

          {/* Scraped Visual Preview Card */}
          {(imageUrl || title) && (
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex gap-3 items-center">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-20 h-14 object-cover rounded-lg bg-slate-900 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded-lg bg-slate-900 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.name}</span>
                  </span>
                </div>
                <h4 className="text-xs font-medium text-slate-200 truncate">
                  {title || "Link Title"}
                </h4>
                {description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title for this link..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Folder & Platform Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Folder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Folder
              </label>
              <div className="relative">
                <FolderIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">(No folder - Save to Inbox)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Platform override */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">X / Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="reddit">Reddit</option>
                <option value="medium">Medium</option>
                <option value="web">General Web / Article</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Thumbnail / Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or auto-scraped"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Personal Notes / Key Takeaways</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you save this? Add timestamps, summary, or key thoughts..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tags & Favorite Checkbox */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex-1 relative">
              <TagIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (comma separated, e.g. ai, react)"
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white px-2 py-1">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
              />
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Mark as Starred</span>
            </label>
          </div>

          {/* Footer Actions */}
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
              disabled={isSubmitting || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Save to LinkVault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
