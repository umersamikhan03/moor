const RAW_API_URL = import.meta.env.VITE_API_URL || "";

const stripTrailingApiPath = (url = "") =>
  String(url || "").replace(/\/api\/?$/i, "").replace(/\/$/, "");

export const getUploadsBaseUrl = () => `${stripTrailingApiPath(RAW_API_URL)}/uploads`;

export const normalizeImagePath = (imageName = "") => {
  const rawValue = String(imageName || "").trim();
  if (!rawValue) return "";

  const normalizedSlashes = rawValue.replace(/\\/g, "/");

  // Keep external URLs untouched when they are not served from /uploads.
  if (/^https?:\/\//i.test(normalizedSlashes) && !/\/uploads\//i.test(normalizedSlashes)) {
    return normalizedSlashes;
  }

  const withoutUploadsPrefix = normalizedSlashes.includes("/uploads/")
    ? normalizedSlashes.split("/uploads/").pop()
    : normalizedSlashes.replace(/^uploads\//i, "");

  return withoutUploadsPrefix.split("?")[0].split("#")[0];
};

export const buildUploadsImageUrl = (imageName = "") => {
  const normalizedImagePath = normalizeImagePath(imageName);
  if (!normalizedImagePath) return "";

  if (/^https?:\/\//i.test(normalizedImagePath)) return normalizedImagePath;

  return `${getUploadsBaseUrl()}/${normalizedImagePath}`;
};
