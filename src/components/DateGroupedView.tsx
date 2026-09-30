"use client";

import React, { useMemo } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { LinkItem, ViewMode } from "@/types";
import LinkCard from "./LinkCard";
import LinkPhotoGrid from "./LinkPhotoGrid";
import TimelineListView from "./TimelineListView";
import {
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
  format,
  parseISO,
} from "date-fns";

interface DateGroupedViewProps {
  links: LinkItem[];
  viewMode: ViewMode;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeleteLink: (id: string, title: string) => void;
  onOpenDetail: (link: LinkItem) => void;
}

interface DateBucket {
  label: string;
  subLabel?: string;
  key: string;
  links: LinkItem[];
}

export default function DateGroupedView({
  links,
  viewMode,
  onToggleFavorite,
  onDeleteLink,
  onOpenDetail,
}: DateGroupedViewProps) {
  // Group links chronologically by day
  const groupedBuckets: DateBucket[] = useMemo(() => {
    const bucketsMap: Record<string, DateBucket> = {};
    const orderedKeys: string[] = [];

    for (const link of links) {
      const date = typeof link.createdAt === "string" ? parseISO(link.createdAt) : new Date(link.createdAt);
      const dayKey = format(date, "yyyy-MM-dd");

      if (!bucketsMap[dayKey]) {
        let label = format(date, "EEEE, MMMM d, yyyy");
        let subLabel = "";

        if (isToday(date)) {
          label = "Today";
          subLabel = format(date, "EEEE, MMMM d");
        } else if (isYesterday(date)) {
          label = "Yesterday";
          subLabel = format(date, "EEEE, MMMM d");
        } else if (isThisWeek(date)) {
          label = format(date, "EEEE");
          subLabel = format(date, "MMMM d");
        } else if (isThisYear(date)) {
          label = format(date, "MMMM d");
          subLabel = format(date, "EEEE");
        } else {
          label = format(date, "MMMM d, yyyy");
        }

        bucketsMap[dayKey] = {
          label,
          subLabel,
          key: dayKey,
          links: [],
        };
        orderedKeys.push(dayKey);
      }

      bucketsMap[dayKey].links.push(link);
    }

    return orderedKeys.map((k) => bucketsMap[k]);
  }, [links]);

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/60 shadow-inner">
          <Calendar className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">
          No links found
        </h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Save your first educational video, post, or article link using the{" "}
          <strong className="text-blue-400 font-medium">New Link</strong> button.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {groupedBuckets.map((bucket) => (
        <section key={bucket.key} className="space-y-3.5">
          {/* Sticky Google Photos Date Header */}
          <div className="sticky top-[110px] z-20 bg-slate-950/90 backdrop-blur-md py-2 px-1 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{bucket.label}</span>
              </h2>
              {bucket.subLabel && (
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  {bucket.subLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-800/80 border border-slate-700/50 px-2.5 py-0.5 rounded-full font-mono">
                {bucket.links.length} {bucket.links.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* Render layout based on viewMode */}
          {viewMode === "photos" && (
            <LinkPhotoGrid
              links={bucket.links}
              onToggleFavorite={onToggleFavorite}
              onOpenDetail={onOpenDetail}
            />
          )}

          {viewMode === "drive" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bucket.links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onToggleFavorite={onToggleFavorite}
                  onDeleteLink={onDeleteLink}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          )}

          {viewMode === "timeline" && (
            <TimelineListView
              links={bucket.links}
              onToggleFavorite={onToggleFavorite}
              onDeleteLink={onDeleteLink}
              onOpenDetail={onOpenDetail}
            />
          )}
        </section>
      ))}
    </div>
  );
}
