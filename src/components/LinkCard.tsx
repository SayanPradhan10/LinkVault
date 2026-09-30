"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Star,
  MoreVertical,
  Trash2,
  Folder as FolderIcon,
  Copy,
  Check,
  FileText,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Globe,
  Share2,
} from "lucide-react";
import { LinkItem } from "@/types";
import { formatDistanceToNow, format } from "date-fns";

interface LinkCardProps {
  link: LinkItem;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeleteLink: (id: string, title: string) => void;
  onOpenDetail: (link: LinkItem) => void;
  onMoveFolder?: (link: LinkItem) => void;
}

export function getPlatformBadge(platform: string) {
  switch (platform) {
    case "youtube":
      return {
        icon: <Youtube className="w-3.5 h-3.5" />,
        name: "YouTube",
        bg: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    case "instagram":
      return {
        icon: <Instagram className="w-3.5 h-3.5" />,
        name: "Instagram",
        bg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      };
    case "twitter":
      return {
        icon: <Twitter className="w-3.5 h-3.5" />,
        name: "X",
        bg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      };
    case "linkedin":
      return {
        icon: <Linkedin className="w-3.5 h-3.5" />,
        name: "LinkedIn",
        bg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      };
    case "github":
      return {
        icon: <Github className="w-3.5 h-3.5" />,
        name: "GitHub",
        bg: "bg-slate-700/60 text-slate-200 border-slate-600/50",
      };
    default:
      return {
        icon: <Globe className="w-3.5 h-3.5" />,
        name: "Web",
        bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      };
  }
}

export default function LinkCard({
  link,
  onToggleFavorite,
  onDeleteLink,
  onOpenDetail,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const badge = getPlatformBadge(link.platform);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createdDate = new Date(link.createdAt);
  const formattedDate = format(createdDate, "MMM d, yyyy");
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <div
      onClick={() => onOpenDetail(link)}
      className="group relative bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {link.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.imageUrl}
            alt={link.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600 p-4">
            <Globe className="w-10 h-10 opacity-30 mb-2" />
            <span className="text-xs text-slate-500 truncate max-w-full">
              {new URL(link.url).hostname}
            </span>
          </div>
        )}

        {/* Platform Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border shadow-sm ${badge.bg}`}
          >
            {badge.icon}
            <span>{badge.name}</span>
          </span>
        </div>

        {/* Quick Actions (Favorite, Share) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            type="button"
            title={link.isFavorite ? "Unfavorite" : "Favorite"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(link.id, link.isFavorite);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              link.isFavorite
                ? "bg-amber-500/30 text-amber-400 border border-amber-500/40"
                : "bg-slate-900/60 text-slate-300 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                link.isFavorite ? "fill-amber-400" : ""
              }`}
            />
          </button>
        </div>

        {/* External Link button overlay on hover */}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 hover:bg-blue-600 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-md"
          title="Open original link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Folder pill if assigned */}
          <div className="flex items-center justify-between mb-2">
            {link.folder ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                style={{
                  backgroundColor: `${link.folder.color}20`,
                  color: link.folder.color,
                }}
              >
                <FolderIcon className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{link.folder.name}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Unsorted</span>
            )}

            {/* Author or Host */}
            <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {link.author || new URL(link.url).hostname.replace("www.", "")}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 line-clamp-2 transition-colors mb-1.5 leading-snug">
            {link.title}
          </h3>

          {/* Description snippet */}
          {link.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {link.description}
            </p>
          )}

          {/* Personal Notes Indicator */}
          {link.notes && (
            <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="line-clamp-2 text-[11px] italic">{link.notes}</p>
            </div>
          )}
        </div>

        {/* Card Footer: Date & Action Menu */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span title={formattedDate} className="text-[11px]">
            {relativeTime}
          </span>

          <div className="flex items-center gap-1 relative">
            <button
              type="button"
              title="Copy URL"
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              title="More options"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 bottom-6 z-40 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onOpenDetail(link);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded-lg"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>View & Edit Notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      handleCopy(e);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded-lg"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copy Link URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDeleteLink(link.id, link.title);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Link</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
