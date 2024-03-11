"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBook } from "../utils/file";
import { BookRender } from "./models/book";
import { CategoryIcon, CategoryModal } from "./components/Category";
import { ScrllToTopButton } from "./components/ScrollTop";
import { db } from "../utils/db";

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
  }, [])
  // get book info
  useEffect(() => {
    let ignore = false;
    const search = new URLSearchParams(location.search.slice(1));
    const url = search.get("url");
    const bookId = search.get('id');
    if (search.get('debug') && typeof window !== 'undefined') {
      import('vconsole').then(res => {
        new res.default();
      })
    }
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
    } else if (bookId){
      db?.books.get(bookId).then(bookRecord => {
        if (!ignore) {
          bookRenderRef.current = new BookRender(bookRecord);
          bookRenderRef.current.render(el.current!, {
            onRender: (params) => {
              setPagination(params);
            },
          });
        }
      });
      
    } else {
      console.log("error: not found url");

    }
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-col">
      {loading && <p className="text-center">loading...</p>}
      <div
        className="text-center w-full cursor-pointer px-4"
        onClick={() => {
          pagination.prevLabel && bookRenderRef.current?.rendition?.prev();
        }}
        id="prev"
      >
        {pagination.prevLabel && "<< "}
        {pagination.prevLabel}
      </div>
      <div ref={el} className="p-4 pt-6 pb-8 flex-1 overflow-auto" style={{minHeight: '90vh'}}></div>
      <div
        className="text-center w-full cursor-pointer px-4 pb-4"
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
