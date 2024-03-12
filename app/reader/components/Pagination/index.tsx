export function Pagination(props: {
  onPrev: () => void;
  onNext: () => void;
  prev: string;
  next: string;
  position: "top" | "bottom";
}) {
  return (
    <div
      className={`absolute flex w-full px-6 " ${
        props.position === "top" ? "top-0 border-b" : "bottom-0 border-t"
      }`}
    >
      <span
        className=" line-clamp-1 cursor-pointer flex-1"
        onClick={props.onPrev}
      >
        {props.prev && `<< ${props.prev}`}
      </span>
      <span className=" w-8"></span>
      <span className="cursor-pointer flex flex-1" onClick={props.onNext}>
        {props.next && (
          <span className=" line-clamp-1 flex-1 min-w-0">
            {props.next}
          </span>
        )}
        {props.next && `>>`}
      </span>
    </div>
  );
}
