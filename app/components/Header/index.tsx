import { handleFiles } from "@/app/utils/file";

export function Header(props) {
  return (
    <div className="flex justify-end h-14 w-full dark:bg-black pr-4 items-center border-b border-gray-300">
      {props.children}

      <button className="relative h-8 px-3 border border-gray-300 bg-zinc-50 dark:bg-black">
        <input
          type="file"
          accept="application/epub+zip,application/epub,application/zip"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const files = e.target.files;
            if (files) handleFiles(files as unknown as File[]);
          }}
        />
        Import
      </button>
    </div>
  );
}
