"use client";

import { useMemo, memo } from "react";
import type { BukuItem } from "./KatalogBukuClient";
import { Book } from "@/components/ui/book";

interface BookMarqueeSectionProps {
  books: BukuItem[];
  onSelectBook: (book: BukuItem) => void;
  failedImages: Record<string, boolean>;
  onImageError: (bookId: string) => void;
  isDark: boolean;
}

const PureMarqueeBook = memo(function PureMarqueeBook({
  book,
  onSelect,
  isFailedImage,
  onImageError,
}: {
  book: BukuItem;
  onSelect: (b: BukuItem) => void;
  isFailedImage: boolean;
  onImageError: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(book)}
      className="group cursor-pointer relative mx-2.5 sm:mx-4 shrink-0 select-none z-10 hover:z-40 transition-transform duration-300"
      title={`${book.judul} - ${book.penulis}`}
    >
      <div className="py-3 sm:py-4">
        <Book
          title={book.judul}
          author={book.penulis}
          coverUrl={isFailedImage ? null : book.cover_url}
          width={{ sm: 135, md: 150, lg: 165 }}
          textured={true}
          onError={() => onImageError(book.id)}
        />
      </div>
    </div>
  );
});

export default function BookMarqueeSection({
  books,
  onSelectBook,
  failedImages,
  onImageError,
}: BookMarqueeSectionProps) {
  // Ensure track has sufficient width for seamless infinite loop (0% to -50% translateX)
  const marqueeItems = useMemo(() => {
    if (!books || books.length === 0) return [];
    
    let baseList = [...books];
    while (baseList.length < 15) {
      baseList = [...baseList, ...books];
    }

    return [...baseList, ...baseList];
  }, [books]);

  if (marqueeItems.length === 0) return null;

  return (
    <section className="w-full py-2 sm:py-4 overflow-hidden relative select-none">
      {/* Seamless 1-Row Infinite Marquee (Keeps scrolling continuously on hover) */}
      <div className="marquee-container overflow-hidden relative marquee-mask py-6 sm:py-8">
        <div className="animate-marquee-track-left items-center py-2 sm:py-3">
          {marqueeItems.map((book, idx) => (
            <PureMarqueeBook
              key={`pure-book-${book.id}-${idx}`}
              book={book}
              onSelect={onSelectBook}
              isFailedImage={Boolean(failedImages[book.id])}
              onImageError={onImageError}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
