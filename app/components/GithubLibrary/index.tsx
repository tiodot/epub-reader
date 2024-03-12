import { useCallback, useState } from "react";
import { SearchGithub } from "../SearchGithub";
import { BookCollection, BookItem } from "../BookCollection";
import Image from "next/image";
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
          <div className="inter flex flex-col absolute h-screen z-10 w-100 max-w-md right-0 top-0 overflow-auto bg-slate-50 dark:bg-gray-900 p-6 pt-1">
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
              <BookCollection books={githubBooks} />
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
