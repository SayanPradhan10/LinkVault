"use client";

import React from "react";
import { ExternalLink, Star, Trash2, FileText, Globe } from "lucide-react";
import { LinkItem } from "@/types";
import { getPlatformBadge } from "./LinkCard";
import { format } from "date-fns";

interface TimelineListViewProps {
  links: LinkItem[];
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeleteLink: (id: string, title: string) => void;
  onOpenDetail: (link: LinkItem) => void;
}

export default function TimelineListView({
  links,
  onToggleFavorite,
  onDeleteLink,
  onOpenDetail,
}: TimelineListViewProps) {
  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {links.map((link) => {
        const badge = getPlatformBadge(link.platform);
        const createdDate = new Date(link.createdAt);
        const formattedTime = format(createdDate, "h:mm a");

        return (
          <div
            key={link.id}
            onClick={() => onOpenDetail(link)}
            className="group relative flex items-center justify-between gap-4 p-3 bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-blue-500/50 rounded-xl transition-all cursor-pointer"
          >
            {/* Timeline bullet dot */}
            <div className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 group-hover:bg-blue-500 border-2 border-slate-950 transition-colors" />

            {/* Left Thumbnail + Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-16 h-12 rounded-lg bg-slate-950 flex-shrink-0 overflow-hidden relative">
                {link.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.imageUrl}
                    alt={link.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Globe className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.name}</span>
                  </span>

                  {link.folder && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: `${link.folder.color}20`,
                        color: link.folder.color,
                      }}
                    >
                      {link.folder.name}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono">
                    {formattedTime}
                  </span>
                </div>

                <h4 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 truncate">
                  {link.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="truncate max-w-[200px] text-slate-500">
                    {link.author || new URL(link.url).hostname}
                  </span>
                  {link.notes && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-400/90 truncate">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[260px] italic">
                        {link.notes}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(link.id, link.isFavorite);
                }}
                className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                  link.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Star
                  className={`w-4 h-4 ${link.isFavorite ? "fill-amber-400" : ""}`}
                />
              </button>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLink(link.id, link.title);
                }}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
