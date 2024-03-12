import { fetchBook } from "@/app/utils/file";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export interface BookItem {
  name: string;
  cover?: string;
  id: string;
  percentage?: number;
  url?: string; // downloading
}

function lock(l: number, r: number, unit = "px") {
  const minw = 400;
  const maxw = 2560;

  return `calc(${l}${unit} + ${r - l} * (100vw - ${minw}px) / ${maxw - minw})`;
}

function Book(props: { book: BookItem }) {
  const router = useRouter();
  const { book } = props;
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (loading) return;
    if (book.url) {
      setLoading(true);
      fetchBook(book.url)
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    // open book
    router.push(`/reader?id=${book.id}`);
    // window.open(`/reader?id=${book.id}`, "_blank");
  };
  return (
    <div
      onClick={handleClick}
      className="relative flex flex-col border bg-white rounded dark:bg-black"
    >
      {loading && (
        <div className="absolute cursor-not-allowed flex justify-center items-center z-10 top-0 bottom-0 left-0 right-0 bg-gray-200/50">
          downloading...
        </div>
      )}
      <div role="button" className="border-inverse-on-surface relative border">
        <div className={"absolute bottom-0 h-1 bg-blue-500"} />
        {book.percentage && book.percentage > 0 && book.percentage < 1 && (
          <div className="typescale-body-large absolute right-0 bg-gray-500/60 px-2 text-gray-100">
            {(book.percentage * 100).toFixed()}%
          </div>
        )}
        <img
          src={book.cover ?? "/empty.png"}
          alt="Cover"
          className="mx-auto object-cover"
          draggable={false}
        />
        {book.id && <div className="absolute bottom-1 right-1"></div>}
      </div>

      <div
        className="px-2 line-clamp-2 text-on-surface-variant typescale-body-small lg:typescale-body-medium mt-2 w-full"
        title={book.name}
      >
        {book.name}
      </div>
    </div>
  );
}

export function BookCollection(props: { books: BookItem[] }) {
  return (
    <div className="scroll h-full m-auto w-11/12">
      <ul
        className="grid"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(calc(80px + 3vw), 1fr))`,
          columnGap: lock(16, 32),
          rowGap: lock(24, 40),
        }}
      >
        {props.books.map((book) => (
          <Book key={book.id} book={book} />
        ))}
      </ul>
    </div>
  );
}
