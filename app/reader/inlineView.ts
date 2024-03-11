//eslint-disabled
import Inline from "epubjs/src/managers/views/inline";
import Section from "epubjs/types/section";
import { defer, qs, parse } from "epubjs/src/utils/core";
import Contents from "epubjs/src/contents";

export default class InlineView extends Inline {
  [key: string]: any;
  constructor(sections: Section, options: any) {
    super(sections, options);
    this.viewName = 'customInlineView'
    // fix inline view bug
    this.width = () => this._width;
    this.height = () => this._height;
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
    const dom = this.frame.attachShadow({mode: 'open'});
    dom.innerHTML = contents;

    // this.frame.innerHTML = contents;

    this.document = this.element.ownerDocument;
    this.window = this.document.defaultView;

    this.contents = new Contents(this.document, this.frame);

    this.rendering = false;

    loading.resolve(this.contents);

    return loaded;
  }
}
