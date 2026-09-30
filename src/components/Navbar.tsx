"use client";

import React from "react";
import {
  Search,
  X,
  LayoutGrid,
  Image as ImageIcon,
  ListFilter,
  Plus,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import { PlatformType, ViewMode, UserProfile } from "@/types";
import UserMenu from "./UserMenu";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPlatform: PlatformType | "all";
  onSelectPlatform: (platform: PlatformType | "all") => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenAddLink: () => void;
  platformCounts?: Record<string, number>;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onImportSuccess: () => void;
}

const PLATFORM_FILTERS: { id: PlatformType | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Links", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "youtube", label: "YouTube", icon: <Youtube className="w-3.5 h-3.5 text-rose-500" /> },
  { id: "instagram", label: "Instagram", icon: <Instagram className="w-3.5 h-3.5 text-pink-500" /> },
  { id: "twitter", label: "X / Twitter", icon: <Twitter className="w-3.5 h-3.5 text-sky-400" /> },
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-3.5 h-3.5 text-blue-400" /> },
  { id: "github", label: "GitHub", icon: <Github className="w-3.5 h-3.5 text-slate-300" /> },
  { id: "web", label: "Articles & Web", icon: <Globe className="w-3.5 h-3.5 text-emerald-400" /> },
];

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedPlatform,
  onSelectPlatform,
  viewMode,
  onChangeViewMode,
  onOpenAddLink,
  platformCounts,
  user,
  onOpenAuth,
  onLogout,
  onImportSuccess,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex flex-col gap-3">
      {/* Top row: Search, Quick Add, View Switcher, User Menu */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search links, titles, notes, platforms, or authors..."
            className="w-full pl-10 pr-9 py-2 bg-slate-800/90 hover:bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/60 text-slate-400">
            <button
              type="button"
              onClick={() => onChangeViewMode("photos")}
              title="Google Photos Visual Grid"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "photos"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photos Grid</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode("drive")}
              title="Drive Cards Grid"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "drive"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drive Cards</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode("timeline")}
              title="Timeline Stream"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "timeline"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "hover:text-slate-200"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

          {/* Quick Add Link Button */}
          <button
            type="button"
            onClick={onOpenAddLink}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Save Link</span>
          </button>

          {/* User Profile / Backup Dropdown */}
          <UserMenu
            user={user}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
            onImportSuccess={onImportSuccess}
          />
        </div>
      </div>

      {/* Bottom row: Platform Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {PLATFORM_FILTERS.map((filter) => {
          const count =
            filter.id === "all"
              ? undefined
              : platformCounts?.[filter.id];
          const isSelected = selectedPlatform === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onSelectPlatform(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 text-blue-300 font-medium"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
              {count !== undefined && count > 0 && (
                <span className="text-[10px] ml-1 px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded-full font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
