import { useEffect, useState } from "react";
import Image from "next/image";
export function ScrllToTopButton() {
  // 控制 ScrollToTopButton 组件的显示与隐藏，以及滚动事件的监听
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    if (document.scrollingElement?.scrollTop && document.scrollingElement.scrollTop > 20) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  const debounceScroll = (() => {
    let timer = setTimeout(() => {}, 0);
    return () => {
      clearTimeout(timer);
      timer = setTimeout(toggleVisibility, 100);
    }
  })()
  // 滚动到顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      // 平滑滚动效果
      behavior: "smooth",
    });
  };
  // 滚动事件监听器
  useEffect(() => {
    window.addEventListener("scroll", debounceScroll);
    return () => window.removeEventListener("scroll", debounceScroll);
  }, []);
  return (
    <div className="scroll-to-top fixed right-3 bottom-3 cursor-pointer">
      {isVisible && <Image src="/top.png" width={16} height={16} alt="top" onClick={scrollToTop} />}
    </div>
  );
}
