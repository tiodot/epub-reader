"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchBook } from "../utils/file";
import { BookRender } from "./models/book";
import { CategoryIcon, CategoryModal } from "./components/Category";
import { ScrllToTopButton } from "./components/ScrollTop";
import { BookRecord, db } from "../utils/db";
import { fixImage, getReaderSize } from "../utils/hack";
import { Pagination } from "./components/Pagination";

export default function Reader() {
  const [categoryVisible, setCategoryVisible] = useState(false);
  const el = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<{
    prevLabel?: string;
    nextLabel?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const bookRenderRef = useRef<BookRender>();
  const closeCategory = useCallback(() => {
    setCategoryVisible(false);
  }, []);
  // get book info
  useEffect(() => {
    let ignore = false;
    const search = new URLSearchParams(location.search.slice(1));
    const url = search.get("url");
    const bookId = search.get("id");
    if (search.get("debug") && typeof window !== "undefined") {
      import("vconsole").then((res) => {
        new res.default();
      });
    }
    const renderBook = (bookRecord: BookRecord) => {
      if (!ignore) {
        // setTitle
        document.title = bookRecord.name;
        bookRenderRef.current = new BookRender(bookRecord);
        bookRenderRef.current.render(el.current!, {
          onRender: (params) => {
            setPagination(params);
          },
          size: getReaderSize(),
        });
      }
    };
    if (url) {
      setLoading(true);
      fetchBook(url)
        .then(renderBook)
        .finally(() => {
          setLoading(false);
        });
    } else if (bookId) {
      db?.books.get(bookId).then(renderBook);
    } else {
      console.log("error: not found url");
    }
    return () => {
      fixImage();
      ignore = true;
    };
  }, []);

  return (
    <div className="relative flex flex-col">
      {loading && <p className="text-center">loading...</p>}
      <Pagination
        onNext={() => {
          bookRenderRef.current?.rendition?.next();
        }}
        onPrev={() => {
          bookRenderRef.current?.rendition?.prev();
        }}
        prev={pagination.prevLabel}
        next={pagination.nextLabel}
        position="top"
      />
      <div
        ref={el}
        className="pt-6 pb-8 flex-1 overflow-auto"
        style={{ minHeight: "90vh" }}
      ></div>
      <Pagination
        onNext={() => {
          bookRenderRef.current?.rendition?.next();
        }}
        onPrev={() => {
          bookRenderRef.current?.rendition?.prev();
        }}
        prev={pagination.prevLabel}
        next={pagination.nextLabel}
        position="bottom"
      />

      <CategoryIcon
        onClick={() => {
          setCategoryVisible(true);
        }}
      />
      <CategoryModal
        visible={categoryVisible}
        items={
          bookRenderRef.current?.sections?.map((section) => ({
            label: section.navitem?.label ?? "",
            href: section.navitem?.href ?? "",
          })) ?? []
        }
        currentHref={bookRenderRef.current?.section?.href}
        onClose={closeCategory}
        onChange={(href) => {
          bookRenderRef.current?.display(href);
          closeCategory();
          console.log("href:", href);
        }}
      />
    </div>
  );
}
