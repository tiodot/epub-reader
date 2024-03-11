"use client";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBook } from "./utils/file";
import { BookRender } from "./models/book";
import { CategoryIcon, CategoryModal } from "./components/Category";
import { ScrllToTopButton } from "./components/ScrollTop";

export default function Reader() {
  const [categoryVisible, setCategoryVisible] = useState(false);
  const el = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<{
    prevLabel?: string;
    nextLabel?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const bookRenderRef = useRef<BookRender>();
  const search = useSearchParams();
  const closeCategory = useCallback(() => {
    setCategoryVisible(false);
  }, [])
  // get book info
  useEffect(() => {
    let ignore = false;
    const url = search.get("url");
    if (url) {
      setLoading(true);
      fetchBook(url).then((bookRecord) => {
        if (!ignore) {
          bookRenderRef.current = new BookRender(bookRecord);
          bookRenderRef.current.render(el.current!, {
            onRender: (params) => {
              setPagination(params);
            },
          });
        }
      }).finally(() => {
        setLoading(false);
      });
    } else {
      console.log("error: not found url");
    }
    return () => {
      ignore = true;
    };
  }, []);
  return (
    <>
      {loading && <p className="text-center">loading...</p>}
      <div
        className="absolute text-center w-full cursor-pointer px-4"
        onClick={() => {
          pagination.prevLabel && bookRenderRef.current?.rendition?.prev();
        }}
        id="prev"
      >
        {pagination.prevLabel && "<< "}
        {pagination.prevLabel}
      </div>
      <div ref={el} className="p-4 pt-6 pb-6 min-h-screen"></div>
      <div
        className="absolute text-center w-full cursor-pointer px-4"
        onClick={() => {
          pagination.nextLabel && bookRenderRef.current?.rendition?.next();
        }}
      >
        {pagination.nextLabel}
        {pagination.nextLabel && " >>"}
      </div>
      <CategoryIcon
        onClick={() => {
          setCategoryVisible(true);
        }}
      />
      <ScrllToTopButton />
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
    </>
  );
}
