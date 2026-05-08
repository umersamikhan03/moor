import { buildUploadsImageUrl, normalizeImagePath } from "./imageUrl.js";

export function setFaviconFromApi(imageName = "") {
  const normalizedImageName = normalizeImagePath(imageName);
  const faviconUrl = buildUploadsImageUrl(imageName);

  // Remove all existing icon links
  const existingIcons = document.querySelectorAll(
    "link[rel~='icon'], link[rel='apple-touch-icon']",
  );
  existingIcons.forEach((link) => link.parentNode.removeChild(link));

  // Only add a new icon if imageName is provided
  if (normalizedImageName) {
    const link = document.createElement("link");
    const ext = normalizedImageName.split(".").pop()?.toLowerCase();
    link.type = ext === "png" ? "image/png" : ext === "svg" ? "image/svg+xml" : "image/x-icon";
    link.rel = "icon";
    link.href = faviconUrl;
    document.head.appendChild(link);
  }
}
