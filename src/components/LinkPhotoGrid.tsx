"use client";

import React from "react";
import { Play, Star, ExternalLink, Globe } from "lucide-react";
import { LinkItem } from "@/types";
import { getPlatformBadge } from "./LinkCard";

interface LinkPhotoGridProps {
  links: LinkItem[];
  onToggleFavorite: (id: string, current: boolean) => void;
  onOpenDetail: (link: LinkItem) => void;
}

export default function LinkPhotoGrid({
  links,
  onToggleFavorite,
  onOpenDetail,
}: LinkPhotoGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {links.map((link) => {
        const badge = getPlatformBadge(link.platform);
        const isVideo = link.platform === "youtube" || link.contentType === "video";

        return (
          <div
            key={link.id}
            onClick={() => onOpenDetail(link)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 hover:border-blue-500/80 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-200"
          >
            {/* Visual Thumbnail */}
            {link.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.imageUrl}
                alt={link.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-500">
                <Globe className="w-8 h-8 opacity-40 mb-2" />
                <span className="text-[11px] line-clamp-2 text-slate-400 font-medium">
                  {link.title}
                </span>
              </div>
            )}

            {/* Gradient Overlay for Readable Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Top Left Platform Badge */}
            <div className="absolute top-2 left-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border shadow-sm ${badge.bg}`}
              >
                {badge.icon}
                <span className="hidden group-hover:inline">{badge.name}</span>
              </span>
            </div>

            {/* Top Right Favorite Button */}
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(link.id, link.isFavorite);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                  link.isFavorite
                    ? "bg-amber-500/40 text-amber-400 border border-amber-500/60"
                    : "bg-slate-900/60 text-slate-300 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100"
                }`}
              >
                <Star
                  className={`w-3 h-3 ${link.isFavorite ? "fill-amber-400" : ""}`}
                />
              </button>
            </div>

            {/* Center Play Icon for Video */}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
            )}

            {/* Bottom Title & Author Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 flex flex-col justify-end">
              <p className="text-xs font-semibold text-white line-clamp-2 leading-tight drop-shadow-sm group-hover:text-blue-300 transition-colors">
                {link.title}
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-300">
                <span className="truncate max-w-[100px] opacity-80">
                  {link.author || new URL(link.url).hostname.replace("www.", "")}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity"
                  title="Open link"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
