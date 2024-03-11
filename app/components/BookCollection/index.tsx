
export interface BookItem {
  url: string;
  label: string;
  cover?: string;
  id: string;
  percentage?: number;
}

function lock(l: number, r: number, unit = "px") {
  const minw = 400;
  const maxw = 2560;

  return `calc(${l}${unit} + ${r - l} * (100vw - ${minw}px) / ${maxw - minw})`;
}

function Book(props: { book: BookItem }) {
  const { book } = props;
  return (
    <div className="relative flex flex-col border bg-white rounded">
      <div
        role="button"
        className="border-inverse-on-surface relative border"
        onClick={() => {
          // open book
          // router.push(`/reader?url=${book.url}&id=${book.id}`)
          window.open(`/reader?url=${book.url}&id=${book.id}`, '_blank');
        }}
      >
        <div className={"absolute bottom-0 h-1 bg-blue-500"} />
        {book.percentage !== undefined && (
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
        title={book.label}
      >
        {book.label}
      </div>
    </div>
  );
}

export function BookCollection(props: {
  books: BookItem[];
  favorite?: boolean;
}) {
  return (
    <div className="scroll h-full w-11/12">
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
