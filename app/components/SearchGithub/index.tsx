"use client";
import React, { useCallback, useMemo, useState } from "react";
import { BookItem } from "../BookCollection";

function generateGitHubRawUrl(
  path: string,
  branch: string,
  user: string,
  repo: string
) {
  return `https://github.com/${user}/${repo}/raw/${branch}/${path}`;
}

export function SearchGithub(props: { onChange: (books: BookItem[]) => void }) {
  const [val, setVal] = useState("tiodot/geektime-books@master");
  const githubInfo = useMemo(() => {
    const [user, repo, branch] = val.split(/[\/|@]/);
    console.log("value:", user, repo, branch);
    return {
      user: user ?? "",
      repo: repo ?? "",
      branch: branch ?? "main",
    };
  }, [val]);
  const [error, setError] = useState("");
  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setVal(value);
      setError("");
    },
    []
  );

  const handleSearch = useCallback(() => {
    if (githubInfo.repo && githubInfo.user) {
      fetch(
        `/github/api/repos/${githubInfo.user}/${githubInfo.repo}/git/trees/${githubInfo.branch}?recursive=3`
      )
        .then((res) => res.json())
        .then((res) => {
          console.log("res:", res.tree);
          const books: BookItem[] = res.tree
            .filter(
              (item: any) =>
                item.type === "blob" && item.path?.endsWith(".epub")
            )
            .map((item: any) => ({
              label: item.path,
              url: generateGitHubRawUrl(
                item.path,
                githubInfo.branch,
                githubInfo.user,
                githubInfo.repo
              ),
              id: item.sha,
            }));
          console.log("books:", books);
          props.onChange(books);
        })
        .catch((err) => {
          console.error(err);
          setError("fetch data error, the github info may not be right");
        });
    } else {
      setError(
        "Please input github info, eg: tiodot/test or tiodot/test@master"
      );
    }
  }, [githubInfo]);
  return (
    <div>
      <div className="mb-4 flex items-center">
        <input
          className="p-2 min-w-80 bg-transparent border"
          placeholder="github USER/REPO[@BRANCH] eg: tiodot/test or tiodot/test@master)"
          onChange={handleInput}
          value={val}
        />
        <button
          className="p-2 border border-blue-200 ml-4 bg-blue-300"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
