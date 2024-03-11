import { useCallback, useState } from "react";
import { SearchGithub } from "../SearchGithub";
import { BookCollection, BookItem } from "../BookCollection";

export function GithubLibrary() {
  const [visible, setVisible] = useState(false);
  const onClose = useCallback(() => {
    setVisible(false);
  }, []);
  const [githubBooks, setGithubBooks] = useState<BookItem[]>([]);
  return (
    <>
      {visible && (
        <div className="outer z-10 top-0 left-0 fixed right-0 bottom-0 bg-slate-500/50">
          <div className="inter absolute h-screen z-10 w-100 max-w-md right-0 top-0 overflow-auto bg-slate-50 p-6 pt-1">
            <div className="h-10 flex border-b w-full pr-4 items-center mb-2">
              <span className=" cursor-pointer" onClick={onClose}>x</span>
              <span className="ml-2">Search Book from Github</span>
            </div>
            <SearchGithub onChange={setGithubBooks} />
            <BookCollection books={githubBooks} />
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
