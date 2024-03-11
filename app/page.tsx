"use client"
import { useAtomValue } from "jotai";
import { BookCollection, BookItem } from "./components/BookCollection";
import { SearchGithub } from "./components/SearchGithub";
import { libraryStore } from "./models/library";
import { useState } from "react";

export default function Home() {
  const localBooks = useAtomValue(libraryStore);
  const [searchBooks, setSearchBooks] = useState<BookItem[]>([]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2 sm:p-4 md:p-24">
      <SearchGithub onChange={(books: BookItem[]) => {
        setSearchBooks(books);
      }} />
      <BookCollection books={searchBooks.length ? searchBooks : localBooks} />
    </main>
  );
}
