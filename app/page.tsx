"use client";
import { BookCollection, BookItem } from "./components/BookCollection";
import { useLibrary } from "./models/library";
import { Header } from "./components/Header";
import { GithubLibrary } from "./components/GithubLibrary";

export default function Home() {
  const books = useLibrary();
  if (!books) return null;
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden items-center">
      <Header>
        <GithubLibrary />
      </Header>
      <div className="container pt-4">
        <BookCollection books={books} />
      </div>
    </main>
  );
}
