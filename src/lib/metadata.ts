import * as cheerio from "cheerio";

export interface ScrapedMetadata {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  faviconUrl: string;
  platform:
    | "youtube"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "github"
    | "reddit"
    | "medium"
    | "web";
  contentType: "video" | "post" | "article" | "code" | "web";
  author?: string;
}

function isAllowedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  // Block localhost
  if (host === "localhost") return false;

  // Block IPv4 private/internal ranges
  const ipv4 = host.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  );

  if (ipv4) {
    const [, a, b, c, d] = ipv4.map(Number);

    if (
      [a, b, c, d].some((part) => part < 0 || part > 255)
    ) {
      return false;
    }

    // 10.0.0.0/8
    if (a === 10) return false;

    // 127.0.0.0/8
    if (a === 127) return false;

    // 169.254.0.0/16
    if (a === 169 && b === 254) return false;

    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return false;

    // 192.168.0.0/16
    if (a === 192 && b === 168) return false;

    // 0.0.0.0/8
    if (a === 0) return false;
  }

  // Block IPv6 localhost/private/link-local ranges
  if (
    host === "::1" ||
    host === "::" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80:")
  ) {
    return false;
  }

  return true;
}

function getSafeUrl(targetUrl: string): URL {
  let url = targetUrl.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  const parsed = new URL(url);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (!isAllowedHostname(parsed.hostname)) {
    throw new Error("This URL is not allowed");
  }

  return parsed;
}

export function detectPlatform(
  urlStr: string
): ScrapedMetadata["platform"] {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");

    if (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtu.be"
    ) {
      return "youtube";
    }

    if (
      host === "instagram.com" ||
      host.endsWith(".instagram.com")
    ) {
      return "instagram";
    }

    if (
      host === "twitter.com" ||
      host.endsWith(".twitter.com") ||
      host === "x.com" ||
      host.endsWith(".x.com")
    ) {
      return "twitter";
    }

    if (
      host === "linkedin.com" ||
      host.endsWith(".linkedin.com")
    ) {
      return "linkedin";
    }

    if (
      host === "github.com" ||
      host.endsWith(".github.com")
    ) {
      return "github";
    }

    if (
      host === "reddit.com" ||
      host.endsWith(".reddit.com")
    ) {
      return "reddit";
    }

    if (
      host === "medium.com" ||
      host.endsWith(".medium.com")
    ) {
      return "medium";
    }

    return "web";
  } catch {
    return "web";
  }
}

export function extractYouTubeVideoId(
  urlStr: string
): string | null {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null;
    }

    if (parsed.pathname.includes("/shorts/")) {
      return (
        parsed.pathname
          .split("/shorts/")[1]
          ?.split("?")[0] || null
      );
    }

    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export async function scrapeUrlMetadata(
  targetUrl: string
): Promise<ScrapedMetadata> {
  const parsedUrl = getSafeUrl(targetUrl);
  const url = parsedUrl.toString();

  const platform = detectPlatform(url);

  let contentType: ScrapedMetadata["contentType"] = "web";

  if (platform === "youtube") {
    contentType = "video";
  } else if (
    platform === "instagram" ||
    platform === "twitter" ||
    platform === "linkedin" ||
    platform === "reddit"
  ) {
    contentType = "post";
  } else if (platform === "github") {
    contentType = "code";
  } else if (platform === "medium") {
    contentType = "article";
  }

  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    parsedUrl.hostname
  )}&sz=64`;

  let title = parsedUrl.hostname;
  let description = "";
  let imageUrl = "";
  let faviconUrl = defaultFavicon;
  let author = "";

  // YouTube
  if (platform === "youtube") {
    const videoId = extractYouTubeVideoId(url);

    if (videoId) {
      imageUrl = `https://img.youtube.com/vi/${encodeURIComponent(
        videoId
      )}/hqdefault.jpg`;
    }

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          url
        )}&format=json`,
        {
          next: { revalidate: 3600 },
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (oembedRes.ok) {
        const data = await oembedRes.json();

        if (data.title) title = data.title;
        if (data.author_name) author = data.author_name;

        if (data.thumbnail_url && !imageUrl) {
          imageUrl = data.thumbnail_url;
        }
      }
    } catch {
      // Continue with generic scraper
    }
  }

  // GitHub
  if (platform === "github") {
    const parts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length >= 2) {
      const [owner, repo] = parts;

      title = `${owner}/${repo}`;
      imageUrl = `https://opengraph.githubassets.com/1/${encodeURIComponent(
        owner
      )}/${encodeURIComponent(repo)}`;
      author = owner;
    }
  }

  // Twitter / X
  if (platform === "twitter") {
    try {
      const oembedRes = await fetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(
          url
        )}`,
        {
          next: { revalidate: 3600 },
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (oembedRes.ok) {
        const data = await oembedRes.json();

        if (data.author_name) {
          author = data.author_name;
        }

        if (data.html) {
          const $ = cheerio.load(data.html);

          title =
            $("p").first().text().slice(0, 120) ||
            `Post by ${author}`;
        }
      }
    } catch {
      // Continue with generic scraper
    }
  }

  // Generic HTML scraping
  try {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 6000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        const ogTitle =
          $('meta[property="og:title"]').attr("content") ||
          $('meta[name="twitter:title"]').attr("content");

        const pageTitle = $("title").text().trim();

        if (ogTitle && ogTitle.trim()) {
          title = ogTitle.trim();
        } else if (
          pageTitle &&
          title === parsedUrl.hostname
        ) {
          title = pageTitle;
        }

        const ogDesc =
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="twitter:description"]').attr("content") ||
          $('meta[name="description"]').attr("content");

        if (ogDesc) {
          description = ogDesc.trim();
        }

        const ogImg =
          $('meta[property="og:image"]').attr("content") ||
          $('meta[name="twitter:image"]').attr("content");

        if (ogImg && !imageUrl) {
          try {
            const imageUrlParsed = new URL(ogImg, url);

            if (isAllowedHostname(imageUrlParsed.hostname)) {
              imageUrl = imageUrlParsed.toString();
            }
          } catch {
            // Ignore invalid image URL
          }
        }

        const ogSiteName =
          $('meta[property="og:site_name"]').attr("content");

        const metaAuthor =
          $('meta[name="author"]').attr("content");

        if (!author) {
          author = metaAuthor || ogSiteName || "";
        }

        // Favicon
        const iconHref =
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href") ||
          $('link[rel="apple-touch-icon"]').attr("href");

        if (iconHref) {
          try {
            const faviconParsed = new URL(iconHref, url);

            if (isAllowedHostname(faviconParsed.hostname)) {
              faviconUrl = faviconParsed.toString();
            }
          } catch {
            // Keep default favicon
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    console.warn(
      "HTML scraping skipped or timed out for:",
      url,
      err
    );
  }

  // Fallback title
  if (!title || title === parsedUrl.hostname) {
    const pathSlug = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, " ");

    if (pathSlug && pathSlug.length > 2) {
      title = `${pathSlug.charAt(0).toUpperCase()}${pathSlug.slice(
        1
      )} - ${parsedUrl.hostname}`;
    } else {
      title = parsedUrl.hostname;
    }
  }

  return {
    url,
    title,
    description,
    imageUrl,
    faviconUrl,
    platform,
    contentType,
    author: author || undefined,
  };
}