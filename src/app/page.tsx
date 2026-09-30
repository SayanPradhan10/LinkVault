"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import DateGroupedView from "@/components/DateGroupedView";
import AddLinkModal from "@/components/AddLinkModal";
import FolderModal from "@/components/FolderModal";
import LinkDetailModal from "@/components/LinkDetailModal";
import AuthModal from "@/components/AuthModal";
import { FolderItem, LinkItem, PlatformType, ViewMode, DashboardStats, UserProfile } from "@/types";
import { Folder as FolderIcon, Plus, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeViewFilter, setActiveViewFilter] = useState<
    "all" | "timeline" | "favorites" | "unorganized" | "folder"
  >("all");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("drive");

  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalParentId, setFolderModalParentId] = useState<string | null>(null);
  const [selectedDetailLink, setSelectedDetailLink] = useState<LinkItem | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fetch Current User
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      }
    } catch (e) {
      console.error("Error fetching user session:", e);
    }
  }, []);

  // Fetch Folders
  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (e) {
      console.error("Error fetching folders:", e);
    }
  }, []);

  // Fetch Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }, []);

  // Fetch Links based on current filter & search
  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (activeViewFilter === "folder" && activeFolderId) {
        params.set("folderId", activeFolderId);
      } else if (activeViewFilter === "unorganized") {
        params.set("folderId", "unorganized");
      } else {
        params.set("folderId", "all");
      }

      if (activeViewFilter === "favorites") {
        params.set("favorite", "true");
      }

      if (selectedPlatform !== "all") {
        params.set("platform", selectedPlatform);
      }

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(`/api/links?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (e) {
      console.error("Error fetching links:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeViewFilter, activeFolderId, selectedPlatform, searchQuery]);

  // Initial load
  useEffect(() => {
    loadUser();
    loadFolders();
    loadStats();
  }, [loadUser, loadFolders, loadStats]);

  // Refresh links when filters change
  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // User Auth Handlers
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    loadFolders();
    loadStats();
    loadLinks();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      loadFolders();
      loadStats();
      loadLinks();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleImportSuccess = () => {
    loadFolders();
    loadStats();
    loadLinks();
  };

  // View & Folder Navigation Handlers
  const handleSelectView = (view: "all" | "timeline" | "favorites" | "unorganized") => {
    setActiveViewFilter(view);
    setActiveFolderId(null);
    if (view === "timeline") {
      setViewMode("timeline");
    }
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveViewFilter("folder");
    setActiveFolderId(folderId);
  };

  const handleOpenCreateFolder = (parentId?: string) => {
    setFolderModalParentId(parentId || (activeViewFilter === "folder" ? activeFolderId : null));
    setIsFolderModalOpen(true);
  };

  const handleFolderCreated = (newFolder: FolderItem) => {
    loadFolders();
    loadStats();
    handleSelectFolder(newFolder.id);
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete folder "${folderName}"? Links inside will be moved to Unsorted.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
      if (res.ok) {
        if (activeFolderId === folderId) {
          handleSelectView("all");
        }
        loadFolders();
        loadStats();
        loadLinks();
      }
    } catch (e) {
      console.error("Error deleting folder:", e);
    }
  };

  const handleLinkAdded = (newLink: LinkItem) => {
    setLinks((prev) => [newLink, ...prev]);
    loadStats();
    loadFolders();
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    // Optimistic update
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !current } : l))
    );
    try {
      await fetch(`/api/links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !current }),
      });
      loadStats();
    } catch (e) {
      console.error(e);
      loadLinks();
    }
  };

  const handleDeleteLink = async (id: string, title: string) => {
    if (!confirm(`Delete link "${title}"?`)) return;

    // Optimistic delete
    setLinks((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      loadStats();
      loadFolders();
    } catch (e) {
      console.error(e);
      loadLinks();
    }
  };

  const handleUpdateLink = (updated: LinkItem) => {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    loadStats();
    loadFolders();
  };

  const handleSeedDemo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Seed data ready!");
      await Promise.all([loadFolders(), loadStats(), loadLinks()]);
    } catch (e) {
      console.error("Error seeding demo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId) || null;
  const childSubfolders = activeFolderId
    ? folders.filter((f) => f.parentId === activeFolderId)
    : [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        activeFolderId={activeFolderId}
        activeViewFilter={activeViewFilter}
        stats={stats}
        user={user}
        onSelectView={handleSelectView}
        onSelectFolder={handleSelectFolder}
        onOpenAddLink={() => setIsAddLinkOpen(true)}
        onOpenCreateFolder={handleOpenCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onSeedDemo={handleSeedDemo}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Sticky Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onOpenAddLink={() => setIsAddLinkOpen(true)}
          platformCounts={stats?.platforms}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onImportSuccess={handleImportSuccess}
        />

        {/* Dashboard Content Container */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {/* Breadcrumb Navigation Trail */}
          <BreadcrumbNav
            activeViewFilter={activeViewFilter}
            activeFolder={activeFolder}
            folders={folders}
            onSelectView={handleSelectView}
            onSelectFolder={handleSelectFolder}
            totalCount={links.length}
          />

          {/* Subfolders row if inside a parent folder */}
          {activeViewFilter === "folder" && childSubfolders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Subfolders
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenCreateFolder(activeFolderId || undefined)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subfolder</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {childSubfolders.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectFolder(sub.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-850 cursor-pointer transition-all group"
                  >
                    <div
                      className="p-1.5 rounded-lg text-white"
                      style={{ backgroundColor: sub.color || "#3b82f6" }}
                    >
                      <FolderIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-medium text-slate-200 group-hover:text-blue-400 truncate">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {sub._count?.links ?? 0} links
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Loading or Date-Grouped Links */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm">Loading your links...</p>
            </div>
          ) : (
            <DateGroupedView
              links={links}
              viewMode={viewMode}
              onToggleFavorite={handleToggleFavorite}
              onDeleteLink={handleDeleteLink}
              onOpenDetail={(link) => setSelectedDetailLink(link)}
            />
          )}
        </div>
      </main>

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        folders={folders}
        defaultFolderId={activeFolderId}
        onLinkAdded={handleLinkAdded}
      />

      {/* Create Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folders={folders}
        defaultParentId={folderModalParentId}
        onFolderCreated={handleFolderCreated}
      />

      {/* Link Detail / Edit / YouTube Player Modal */}
      <LinkDetailModal
        link={selectedDetailLink}
        folders={folders}
        isOpen={!!selectedDetailLink}
        onClose={() => setSelectedDetailLink(null)}
        onUpdateLink={handleUpdateLink}
        onDeleteLink={handleDeleteLink}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
