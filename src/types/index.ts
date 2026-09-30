export type PlatformType =
  | "youtube"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "github"
  | "reddit"
  | "medium"
  | "web";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface FolderItem {
  id: string;
  userId?: string | null;
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  children?: FolderItem[];
  _count?: {
    links: number;
    children?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TagItem {
  id: string;
  name: string;
  color?: string | null;
}

export interface LinkTagItem {
  linkId: string;
  tagId: string;
  tag: TagItem;
}

export interface LinkItem {
  id: string;
  userId?: string | null;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  platform: PlatformType;
  contentType: string | null;
  author: string | null;
  notes: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  folderId: string | null;
  folder?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  tags?: LinkTagItem[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = "drive" | "photos" | "timeline";

export interface DashboardStats {
  totalLinks: number;
  totalFolders: number;
  favoritesCount: number;
  unorganizedCount: number;
  platforms: Record<string, number>;
}
