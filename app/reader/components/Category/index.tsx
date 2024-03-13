import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

interface CategoryItem {
  label: string;
  href: string;
  level?: string;
}

function CategoryRow(
  props: CategoryItem & { onClick: () => void; active?: boolean }
) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (props.active) {
      ref.current?.scrollIntoView();
    }
  }, []);

  return (
    <li
      key={props.href}
      ref={ref}
      className={`${
        props.active ? "text-blue-600/100" : ""
      } cursor-pointer pt-2 pb-2 border-bottom border-1px`}
      onClick={props.onClick}
    >
      <p>{props.label}</p>
    </li>
  );
}

export function Category(props: {
  items: CategoryItem[];
  currentHref?: string;
  onChange: (href: string) => void;
}) {
  return (
    <ul className="flex flex-col">
      {props.items.map((item) => (
        <CategoryRow
          label={item.label}
          key={item.href}
          active={item.href === props.currentHref}
          href={item.href}
          onClick={() => {
            props.onChange(item.href);
          }}
        />
      ))}
    </ul>
  );
}

export function CategoryModal(props: {
  items: CategoryItem[];
  currentHref?: string;
  onChange: (href: string) => void;
  onClose: () => void;
  visible: boolean;
}) {
  const showClose = useMemo(() => {
    if (typeof document === 'undefined') return false;
    return document.body.clientWidth < 600;
  }, []);
  if (!props.visible) return null;
  return (
    <div
      className="outer top-0 left-0 fixed right-0 bottom-0 bg-slate-500/50"
      onClick={(e) => {
        if ((e.target as HTMLDivElement).classList.contains("outer")) {
          props.onClose();
        }
      }}
    >
      <div
        className="absolute h-screen z-10 w-100 max-w-md right-0 top-0 overflow-auto pb-24 bg-slate-50 dark:bg-black p-6 pt-1"
        style={{ overscrollBehavior: "none" }}
      >
        <Category
          currentHref={props.currentHref}
          items={props.items}
          onChange={props.onChange}
        ></Category>
        {showClose && (
          <button
            className="w-full h-8 bg-gray-300 dark:bg-black border"
            onClick={props.onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

export function CategoryIcon(props: { onClick: () => void }) {
  return (
    <div className="fixed z-0 right-3 bottom-10 cursor-pointer" onClick={props.onClick}>
      <Image
        width={16}
        height={16}
        unoptimized
        src="/category.svg"
        alt="category"
        className="w-full h-full"
      />
    </div>
  );
}
