"use client";

import React from "react";
import { ChevronRight, Home, Folder as FolderIcon, Star, Clock, Inbox } from "lucide-react";
import { FolderItem } from "@/types";

interface BreadcrumbNavProps {
  activeViewFilter: "all" | "timeline" | "favorites" | "unorganized" | "folder";
  activeFolder: FolderItem | null;
  folders: FolderItem[];
  onSelectView: (view: "all" | "timeline" | "favorites" | "unorganized") => void;
  onSelectFolder: (folderId: string) => void;
  totalCount: number;
}

export default function BreadcrumbNav({
  activeViewFilter,
  activeFolder,
  folders,
  onSelectView,
  onSelectFolder,
  totalCount,
}: BreadcrumbNavProps) {
  // Build breadcrumb trail if in a folder
  const buildFolderTrail = (current: FolderItem | null): FolderItem[] => {
    if (!current) return [];
    const trail: FolderItem[] = [current];
    let parentId = current.parentId;
    while (parentId) {
      const parent = folders.find((f) => f.id === parentId);
      if (parent) {
        trail.unshift(parent);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    return trail;
  };

  const trail = activeViewFilter === "folder" ? buildFolderTrail(activeFolder) : [];

  return (
    <div className="flex items-center justify-between py-2 px-1 text-sm border-b border-slate-800/40 mb-4">
      <nav className="flex items-center gap-1.5 text-slate-400 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectView("all")}
          className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-1.5 rounded-md hover:bg-slate-800"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span className="font-medium">LinkVault</span>
        </button>

        {activeViewFilter === "all" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              All Links
            </span>
          </>
        )}

        {activeViewFilter === "timeline" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              Date Timeline
            </span>
          </>
        )}

        {activeViewFilter === "favorites" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Starred Links
            </span>
          </>
        )}

        {activeViewFilter === "unorganized" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-slate-400" />
              Inbox / Unsorted
            </span>
          </>
        )}

        {activeViewFilter === "folder" &&
          trail.map((folder, idx) => {
            const isLast = idx === trail.length - 1;
            return (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                {isLast ? (
                  <span
                    className="text-white font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: `${folder.color}25`, color: folder.color }}
                  >
                    <FolderIcon className="w-3.5 h-3.5" />
                    {folder.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectFolder(folder.id)}
                    className="hover:text-white transition-colors py-1 px-1.5 rounded-md hover:bg-slate-800 flex items-center gap-1"
                  >
                    <FolderIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{folder.name}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
      </nav>

      <div className="text-xs text-slate-500 font-mono flex-shrink-0">
        {totalCount} {totalCount === 1 ? "link" : "links"}
      </div>
    </div>
  );
}
