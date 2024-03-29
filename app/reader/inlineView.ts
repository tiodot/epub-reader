//eslint-disabled
import Inline from "epubjs/src/managers/views/inline";
import Section from "epubjs/types/section";
import { defer, qs, parse, isNumber } from "epubjs/src/utils/core";
import Contents from "epubjs/src/contents";

const styleStr = `
<style>
h1, h2, h3, h4, h5 {
  color: rgb(var(--foreground-rgb));
}

code, tt, pre {
  background-color: rgb(var(--background-start-bg));
}

video {
  display: none;
}
svg {
  max-width: 100px;
}

</style>
`

export default class InlineView extends Inline {
  [key: string]: any;
  constructor(sections: Section, options: any) {
    super(sections, options);
    this.viewName = "customInlineView";
    // fix inline view bug
    this.width = () => this._width;
    this.height = () => this._height;
    this.offset = () => ({
      top: this.element.offsetTop,
      left: this.element.offsetLeft,
    });
  }
  // width() {
  //   return this._width;
  // }
  // height() {
  //   return this._height;
  // }

  load(contents: string) {
    const loading = new defer();
    const loaded = loading.promise;
    const dom = this.frame.attachShadow({ mode: "open" });
    dom.innerHTML = contents + styleStr;

    // this.frame.innerHTML = contents;

    this.document = this.element.ownerDocument;
    this.window = this.document.defaultView;

    this.contents = new Contents(this.document, this.frame);

    this.rendering = false;

    loading.resolve(this.contents);

    return loaded;
  }

  resize(width, height) {
    console.log('resize:', width, height);
    if (!this.frame) return;

    if (isNumber(width)) {
      this.frame.style.width = width + "px";
      this._width = width;
    }

    if (isNumber(height)) {
      this.frame.style.height = height + "px";
      this._height = height;
    }
  }
}
