import { useCallback, useContext, useRef, useState } from "react";
import { SearchGithub } from "../SearchGithub";
import { BookCollection, BookItem } from "../BookCollection";
import Image from "next/image";
import { fetchBook } from "@/app/utils/file";

function BookListItem(props: { book: BookItem }) {
  const [loading, setLoading] = useState(false);
  const handleDownload = () => {
    const { book } = props;
    if (book.url && !loading) {
      setLoading(true);
      fetchBook(book.url)
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  return (
    <li onClick={handleDownload} className=" cursor-pointer py-2 border-b">
      {props.book.name} {loading ? "(downloading....)" : ""}
    </li>
  );
}

function BookList(props: { books: BookItem[] }) {
  const [keyword, setKeyword] = useState("");
  const books = props.books.filter((book) => book.name.includes(keyword));

  if (!props.books?.length) return null;

  return (
    <div className="">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="p-2 min-w-60 bg-transparent border"
        placeholder="Filter books"
      />
      <ul className="flex flex-col">
        {books.map((book) => (
          <BookListItem key={book.id} book={book} />
        ))}
      </ul>
    </div>
  );
}

export function GithubLibrary() {
  const [visible, setVisible] = useState(false);
  const onClose = useCallback(() => {
    setVisible(false);
  }, []);
  const [githubBooks, setGithubBooks] = useState<BookItem[]>([]);
  return (
    <>
      {visible && (
        <div className="outer z-10 top-0 left-0 fixed right-0 bottom-0 bg-slate-500/50 dark:bg-black/45">
          <div className="inter flex flex-col absolute h-screen z-10 w-3/5 max-w-md right-0 top-0 overflow-auto bg-slate-50 dark:bg-gray-900 p-6 pt-1">
            <div className="h-10 flex border-b w-full pr-4 items-center mb-2">
              <Image
                className=" cursor-pointer"
                src="/close.svg"
                width={16}
                height={16}
                alt="close"
                onClick={onClose}
              ></Image>
              <span className="ml-4">Search Books from Github</span>
            </div>
            <div className="flex-1 overflow-auto">
              <SearchGithub onChange={setGithubBooks} />

              <BookList books={githubBooks} />
            </div>
          </div>
        </div>
      )}
      <button
        className="h-8 px-3 border mr-2"
        onClick={() => {
          setVisible(true);
        }}
      >
        Import from Github
      </button>
    </>
  );
}
