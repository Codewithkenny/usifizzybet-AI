"use client";

import * as React from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  `);

interface ImageProps extends Omit<NextImageProps, "src"> {
  src?: string | null;
  fittingType?: "fit" | "fill";
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      className,
      fittingType = "fill",
      alt = "Sports fixture asset",
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = React.useState(Boolean(src));
    const [error, setError] = React.useState(!src);

    React.useEffect(() => {
      setIsLoading(Boolean(src));
      setError(!src);
    }, [src]);

    const resolvedSrc = error || !src ? FALLBACK_IMAGE_PLACEHOLDER : src;

    return (
      <div
        className={cn(
          "relative inline-block h-full w-full overflow-hidden rounded-xl bg-muted/20",
          isLoading && "animate-pulse",
        )}
      >
        <NextImage
          ref={ref}
          src={resolvedSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1024px"
          className={cn(
            "transition-all duration-300 ease-in-out",
            fittingType === "fill" ? "object-cover" : "object-contain",
            isLoading ? "scale-105 blur-md" : "scale-100 blur-0",
            className,
          )}
          onLoad={(event) => {
            setIsLoading(false);
            onLoad?.(event);
          }}
          onError={(event) => {
            setError(true);
            setIsLoading(false);
            onError?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);

Image.displayName = "Image";

export { Image };
