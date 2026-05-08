import React, { useState, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import useIsMobile from "../../utils/useIsMobile.js";
import { buildUploadsImageUrl } from "../../utils/imageUrl.js";

const ImageComponentWithCompression = ({
  imageName,
  fallbackImageName = "",
  className = "",
  altName,
  skeletonHeight,
  width,
  height,
  loadingStrategy = "lazy",
  fetchPriority = "auto",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeImageName, setActiveImageName] = useState(imageName || "");
  const [usedFallback, setUsedFallback] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    setActiveImageName(imageName || "");
    setUsedFallback(false);
    setHasError(false);
    setIsLoading(true);
  }, [imageName]);

  if (!activeImageName) return null;

  const baseUrl = buildUploadsImageUrl(activeImageName);

  // 🔥 Adjust dimensions for mobile
  const { finalWidth, finalHeight } = useMemo(() => {
    if (!isMobile) {
      return { finalWidth: width, finalHeight: height };
    }

    return {
      finalWidth: width ? Math.floor(width / 2) : undefined,
      finalHeight: height ? Math.floor(height / 2) : undefined,
    };
  }, [isMobile, width, height]);

  // Build URL params
  const params = new URLSearchParams();
  if (finalWidth) params.append("width", finalWidth);
  if (finalHeight) params.append("height", finalHeight);

  const imageUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  return (
    <div className="relative overflow-hidden">
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10">
          <Skeleton height={skeletonHeight} width="100%" />
        </div>
      )}

      <img
        src={imageUrl}
        alt={altName || "Image"}
        className={`${className || "w-full h-auto"} transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!usedFallback && fallbackImageName && fallbackImageName !== activeImageName) {
            setActiveImageName(fallbackImageName);
            setUsedFallback(true);
            setHasError(false);
            setIsLoading(true);
            return;
          }
          setIsLoading(false);
          setHasError(true);
        }}
        loading={loadingStrategy}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </div>
  );
};

export default ImageComponentWithCompression;
