"use client";

import React, { useState } from "react";
import {
  Folder as FolderIcon,
  FolderPlus,
  Plus,
  Star,
  Clock,
  Layers,
  Inbox,
  ChevronRight,
  ChevronDown,
  Trash2,
  BookmarkCheck,
  Code,
  Server,
  Brain,
  Palette,
  Sparkles,
  BookOpen,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { FolderItem, DashboardStats, UserProfile } from "@/types";

interface SidebarProps {
  folders: FolderItem[];
  activeFolderId: string | null;
  activeViewFilter: "all" | "timeline" | "favorites" | "unorganized" | "folder";
  stats: DashboardStats | null;
  user: UserProfile | null;
  onSelectView: (view: "all" | "timeline" | "favorites" | "unorganized") => void;
  onSelectFolder: (folderId: string) => void;
  onOpenAddLink: () => void;
  onOpenCreateFolder: (parentId?: string) => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onSeedDemo: () => void;
  onOpenAuth: () => void;
}

const FOLDER_ICONS: Record<string, React.ReactNode> = {
  folder: <FolderIcon className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  server: <Server className="w-4 h-4" />,
  brain: <Brain className="w-4 h-4" />,
  palette: <Palette className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
};

export default function Sidebar({
  folders,
  activeFolderId,
  activeViewFilter,
  stats,
  user,
  onSelectView,
  onSelectFolder,
  onOpenAddLink,
  onOpenCreateFolder,
  onDeleteFolder,
  onSeedDemo,
  onOpenAuth,
}: SidebarProps) {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
  });

  const toggleExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const rootFolders = folders.filter((f) => !f.parentId);

  const renderFolderItem = (folder: FolderItem, depth = 0) => {
    const hasChildren = (folder.children && folder.children.length > 0) || false;
    const isExpanded = expandedFolders[folder.id] ?? true;
    const isSelected = activeViewFilter === "folder" && activeFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none group/item">
        <div
          onClick={() => onSelectFolder(folder.id)}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
            isSelected
              ? "bg-blue-600 text-white font-medium shadow-sm"
              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
          }`}
          style={{ paddingLeft: `${Math.max(10, depth * 16 + 10)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(folder.id, e)}
                className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block opacity-0" />
            )}

            <div
              className="p-1 rounded text-white flex-shrink-0"
              style={{ backgroundColor: folder.color || "#3b82f6" }}
            >
              {FOLDER_ICONS[folder.icon] || <FolderIcon className="w-3.5 h-3.5" />}
            </div>

            <span className="truncate">{folder.name}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <button
              title="Add Subfolder"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateFolder(folder.id);
              }}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button
              title="Delete Folder"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder.id, folder.name);
              }}
              className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {folder._count?.links !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-blue-700 text-blue-100" : "bg-slate-800 text-slate-400"
                }`}
              >
                {folder._count.links}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 space-y-0.5 border-l border-slate-800 ml-4">
            {folder.children!.map((child) => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 backdrop-blur-md">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              LinkVault
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-md">
                Drive
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Visual Organizer</p>
          </div>
        </div>
      </div>

      {/* New Action Dropdown */}
      <div className="p-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Link / Folder</span>
          </button>

          {isNewMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNewMenuOpen(false)}
              />
              <div className="absolute top-12 left-0 right-0 z-50 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenAddLink();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Save New Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenCreateFolder();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                  <span>Create Folder</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 space-y-1">
        <button
          type="button"
          onClick={() => onSelectView("all")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
            activeViewFilter === "all"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>All Links</span>
          </div>
          {stats?.totalLinks !== undefined && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {stats.totalLinks}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectView("timeline")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
            activeViewFilter === "timeline"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Date Timeline</span>
          </div>
          <span className="text-[10px] uppercase font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
            Photos
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView("favorites")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
            activeViewFilter === "favorites"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Starred Links</span>
          </div>
          {stats?.favoritesCount !== undefined && stats.favoritesCount > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
              {stats.favoritesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectView("unorganized")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
            activeViewFilter === "unorganized"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Inbox className="w-4 h-4 text-slate-400" />
            <span>Inbox / Unsorted</span>
          </div>
          {stats?.unorganizedCount !== undefined && stats.unorganizedCount > 0 && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {stats.unorganizedCount}
            </span>
          )}
        </button>
      </nav>

      {/* Folders Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Folders</span>
          <button
            type="button"
            onClick={() => onOpenCreateFolder()}
            title="Create root folder"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {rootFolders.length === 0 ? (
          <div className="text-center py-6 px-3 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No folders created yet.
            <button
              type="button"
              onClick={() => onOpenCreateFolder()}
              className="mt-2 text-blue-400 hover:underline block mx-auto text-xs"
            >
              + Create your first folder
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootFolders.map((folder) => renderFolderItem(folder, 0))}
          </div>
        )}
      </div>

      {/* User / Demo Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 space-y-2">
        {!user && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In for Cloud Vault</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSeedDemo}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-700/50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Load Demo Links</span>
        </button>
      </div>
    </aside>
  );
}
