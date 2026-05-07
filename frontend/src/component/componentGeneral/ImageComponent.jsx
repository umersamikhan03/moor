import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";

const normalizeImagePath = (imageName = "") => {
  const rawValue = String(imageName || "").trim();
  if (!rawValue) return "";
  if (/^https?:\/\//i.test(rawValue)) return rawValue;

  const normalized = rawValue.replace(/\\/g, "/");
  const withoutUploadsPrefix = normalized.includes("/uploads/")
    ? normalized.split("/uploads/").pop()
    : normalized.replace(/^uploads\//i, "");

  return withoutUploadsPrefix.split("?")[0];
};

const ImageComponent = ({
  imageName,
  className = "",
  altName,
  skeletonHeight,
}) => {
  const [imageSrc, setImageSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageName) {
      const apiUrl = import.meta.env.VITE_API_URL;
      const normalizedImagePath = normalizeImagePath(imageName);
      const imageUrl = /^https?:\/\//i.test(normalizedImagePath)
        ? normalizedImagePath
        : `${apiUrl.replace("/api", "")}/uploads/${normalizedImagePath}`;
      setImageSrc(imageUrl);
      setIsLoading(true);
    } else {
      setImageSrc("");
      setIsLoading(false);
    }
  }, [imageName]);

  return (
    <div>
      {isLoading && <Skeleton height={skeletonHeight} width={"100%"} />}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={altName}
          className={className}
          style={{ display: isLoading ? "none" : "block" }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setImageSrc("");
          }}
        />
      )}
    </div>
  );
};

export default ImageComponent;
