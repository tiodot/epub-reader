/**
 * Clear the epub.js dom's effect
 */

export function fixImage() {
  if (typeof document === "undefined") return;
  const $head = document.querySelector("head");
  $head.querySelectorAll("style").forEach((item) => {
    if (item.id?.startsWith("epubjs-inserted-css")) {
      $head.removeChild(item);
    }
  });
}

export function isIOS() {
  if (typeof navigator === "undefined") return;
  if (/iPhone|iPad/i.test(navigator.userAgent)) return true;
}

/**
 * Fix iOS device scroll will make the address bar hided and trigger resize event.
 * @returns
 */
export function getReaderSize(): { width: number; height: number } | undefined {
  if (isIOS())
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    };
  return;
}
