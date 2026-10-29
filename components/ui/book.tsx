"use client";

import React, { useState } from "react";
import { useResponsive, ResponsiveProp } from "@/components/ui/use-responsive";
import clsx from "clsx";

const DefaultIllustration = (
  <svg fill="none" height="56" viewBox="0 0 36 56" width="36" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M3.03113 28.0005C6.26017 23.1765 11.7592 20.0005 18 20.0005C24.2409 20.0005 29.7399 23.1765 32.9689 28.0005C29.7399 32.8244 24.2409 36.0005 18 36.0005C11.7592 36.0005 6.26017 32.8244 3.03113 28.0005Z"
      fill="#0070F3"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M32.9691 28.0012C34.8835 25.1411 36 21.7017 36 18.0015C36 8.06034 27.9411 0.00146484 18 0.00146484C8.05887 0.00146484 0 8.06034 0 18.0015C0 21.7017 1.11648 25.1411 3.03094 28.0012C6.25996 23.1771 11.7591 20.001 18 20.001C24.2409 20.001 29.74 23.1771 32.9691 28.0012Z"
      fill="#45DEC4"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M32.9692 28.0005C29.7402 32.8247 24.241 36.001 18 36.001C11.759 36.001 6.25977 32.8247 3.03077 28.0005C1.11642 30.8606 0 34.2999 0 38C0 47.9411 8.05887 56 18 56C27.9411 56 36 47.9411 36 38C36 34.2999 34.8836 30.8606 32.9692 28.0005Z"
      fill="#E5484D"
      fillRule="evenodd"
    />
  </svg>
);

export interface BookProps {
  title: string;
  author?: string;
  variant?: "simple" | "stripe" | "cover";
  coverUrl?: string | null;
  width?: number | ResponsiveProp<number>;
  color?: string;
  textColor?: string;
  illustration?: React.ReactNode;
  textured?: boolean;
  category?: string | null;
  isEbook?: boolean;
  rating?: number | string;
  className?: string;
  onError?: () => void;
}

export const Book = ({
  title,
  author,
  variant = "stripe",
  coverUrl,
  width = 180,
  color,
  textColor = "var(--ds-gray-1000)",
  illustration,
  textured = true,
  category,
  isEbook,
  rating,
  className,
  onError,
}: BookProps) => {
  const _width = useResponsive(width);
  const _color = color ? color : variant === "simple" ? "var(--ds-background-200)" : "var(--ds-amber-600)";
  const _illustration = illustration ? illustration : DefaultIllustration;
  const [imageError, setImageError] = useState(false);

  const hasValidCover = Boolean(coverUrl && !imageError);

  const handleImgError = () => {
    setImageError(true);
    onError?.();
  };

  return (
    <div className={clsx("inline-block w-fit select-none", className)} style={{ perspective: 900 }}>
      <div
        className="aspect-[2/3] w-fit relative rotate-0 duration-[250ms] book-rotate"
        style={{ transformStyle: "preserve-3d", minWidth: _width, containerType: "inline-size" }}
      >
        {/* Front Book Cover Block */}
        <div
          className="flex flex-col h-full rounded-l-md rounded-r overflow-hidden bg-background-200 shadow-book translate-x-0 relative after:absolute after:border after:border-gray-alpha-400 after:w-full after:h-full after:shadow-book-border after:rounded-l-md after:rounded-r"
          style={{ width: _width }}
        >
          {hasValidCover ? (
            /* Genuine Graphic Book Cover (Malaka Books tactile aesthetic) */
            <div className="w-full h-full relative overflow-hidden flex-1 bg-slate-900 select-none">
              <img
                src={coverUrl!}
                alt={title}
                onError={handleImgError}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />

              {/* Realistic book binding spine overlay (var(--ds-book-bind)) */}
              <div
                className="absolute inset-y-0 left-0 h-full w-[8.2%] mix-blend-multiply opacity-80 pointer-events-none"
                style={{ background: "var(--ds-book-bind)" }}
              />
              <div
                className="absolute inset-y-0 left-0 h-full w-[8.2%] mix-blend-overlay opacity-60 pointer-events-none"
                style={{ background: "var(--ds-book-bind)" }}
              />
            </div>
          ) : (
            /* Typographic Editorial Fallback Book Cover (Official 21st.dev Geist Layout) */
            <>
              <div
                className={clsx(
                  "w-full relative overflow-hidden",
                  variant === "stripe" && "flex-1"
                )}
                style={{ background: _color }}
              >
                {variant === "stripe" && (
                  <div className="absolute h-full w-full flex items-center justify-center p-3">
                    {_illustration}
                  </div>
                )}
                <div
                  className="absolute h-full w-[8.2%] mix-blend-overlay"
                  style={{ background: "var(--ds-book-bind)" }}
                />
              </div>

              <div
                className={clsx(
                  "relative flex-1",
                  (variant === "stripe" || (variant === "simple" && color === undefined)) && "bg-book-gradient"
                )}
                style={{ background: variant === "simple" && color !== undefined ? _color : undefined }}
              >
                <div
                  className="absolute h-full w-[8.2%] opacity-20"
                  style={{ background: "var(--ds-book-bind)" }}
                />

                <div
                  className={clsx(
                    "flex flex-col w-full p-[6.1%] pl-[14.3%]",
                    variant === "simple" ? "gap-4" : "justify-between"
                  )}
                  style={{ containerType: "inline-size", gap: `calc((24px / 196) * ${_width})` }}
                >
                  <span
                    className={clsx(
                      "leading-[1.25em] tracking-[-.02em] text-balance font-semibold",
                      variant === "simple" ? "text-[12cqw]" : "text-[10.5cqw]"
                    )}
                    style={{ color: textColor }}
                  >
                    {title}
                  </span>

                  {variant === "stripe" ? (
                    <div className="flex items-center justify-between">
                      {category ? (
                        <span className="text-[7.5cqw] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {category}
                        </span>
                      ) : (
                        <svg className="scale-75 -ml-1 -mb-1" height="24" width="24" style={{ fill: textColor }}>
                          <path d="M21,21H3L12,3Z" />
                        </svg>
                      )}
                      {rating && (
                        <span className="text-[7.5cqw] font-bold text-amber-500">
                          ★ {rating}
                        </span>
                      )}
                    </div>
                  ) : (
                    _illustration
                  )}
                </div>
              </div>
            </>
          )}

          {/* Book Texture Overlay (avif) */}
          {textured && (
            <div
              className="absolute top-0 left-0 inset-0 rotate-180 rounded-l-md rounded-r mix-blend-hard-light pointer-events-none bg-cover bg-no-repeat opacity-50 brightness-110 bg-[url('https://cdn.21st.dev/assets/mirror/1a/1a2ecfcafab4d36898151e5960d2bddd8c13c8b5e3721538ce626d366810e518.avif')]"
            />
          )}
        </div>

        {/* Realistic 3D Paper Pages on the Right Side */}
        <div
          className="h-[calc(100%_-_2_*_3px)] w-[calc(29cqw_-_2px)] absolute top-[3px] select-none pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #eaeaea, transparent 70%), linear-gradient(#fff, #fafafa)",
            transform: `translateX(calc(${_width} * 1px - 29cqw / 2 - 3px)) rotateY(90deg) translateX(calc(29cqw / 2))`,
          }}
        />

        {/* Realistic 3D Back Cover */}
        <div
          className="bg-gray-200 absolute left-0 top-0 rounded-l-md rounded-r h-full select-none pointer-events-none"
          style={{ width: _width, transform: "translateZ(calc(-1 * 29cqw))" }}
        />
      </div>
    </div>
  );
};

export default Book;
