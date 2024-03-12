import { atom, useSetAtom } from "jotai";
import { BookRecord, db } from "../../utils/db";
import { dfs, find, INode } from "../../utils/tree";
import InlineView from '../inlineView';


import { Book, Rendition, Location } from "epubjs";
import Navigation, { NavItem } from "epubjs/types/navigation";
import Section from "epubjs/types/section";
import { fileToEpub } from "../../utils/file";

export const defaultStyle = {
  html: {
    padding: "0 !important",
  },
  body: {
    background: "transparent",
  },
  "a:any-link": {
    color: "#3b82f6 !important",
    "text-decoration": "none !important",
  },
  "::selection": {
    "background-color": "rgba(3, 102, 214, 0.2)",
  },
};

export function compareHref(
  sectionHref: string | undefined,
  navitemHref: string | undefined
) {
  if (sectionHref && navitemHref) {
    const [target] = navitemHref.split("#");

    return (
      sectionHref.endsWith(target!) ||
      // fix for relative nav path `../Text/example.html`
      target?.endsWith(sectionHref)
    );
  }
}

function compareDefinition(d1: string, d2: string) {
  return d1.toLowerCase() === d2.toLowerCase();
}

export interface INavItem extends NavItem, INode {
  subitems?: INavItem[];
}

export interface IMatch extends INode {
  excerpt: string;
  description?: string;
  cfi?: string;
  subitems?: IMatch[];
}

export interface ISection extends Section {
  length: number;
  images: string[];
  navitem?: INavItem;
}

interface TimelineItem {
  location: Location;
  timestamp: number;
}

export class BookRender {
  epub?: Book;
  iframe?: Window;
  rendition?: Rendition & { manager?: any };
  nav?: Navigation;
  locationToReturn?: Location;
  section?: ISection;
  sections?: ISection[];
  results?: IMatch[];
  activeResultID?: string;
  rendered = false;

  get container() {
    return this?.rendition?.manager?.container as HTMLDivElement | undefined;
  }

  timeline: TimelineItem[] = [];
  get location() {
    return this.timeline[0]?.location;
  }

  display(target?: string, returnable = true) {
    this.rendition?.display(target);
    if (returnable) this.showPrevLocation();
  }
  displayFromSelector(selector: string, section: ISection, returnable = true) {
    try {
      const el = section.document.querySelector(selector);
      if (el) this.display(section.cfiFromElement(el), returnable);
    } catch (err) {
      this.display(section.href, returnable);
    }
  }
  prev() {
    this.rendition?.prev();
    // avoid content flash
    if (this.container?.scrollLeft === 0 && !this.location?.atStart) {
      this.rendered = false;
    }
  }
  next() {
    this.rendition?.next();
  }

  updateBook(changes: Partial<BookRecord>) {
    changes = {
      ...changes,
      updatedAt: Date.now(),
    };
    // don't wait promise resolve to make valtio batch updates
    this.book = { ...this.book, ...changes };
    db?.books.update(this.book.id, changes);
  }

  annotationRange?: Range;
  setAnnotationRange(cfi: string) {
    const range = this.view?.contents.range(cfi);
    if (range) this.annotationRange = range;
  }

  define(def: string[]) {
    this.updateBook({ definitions: [...this.book.definitions, ...def] });
  }
  undefine(def: string) {
    this.updateBook({
      definitions: this.book.definitions.filter(
        (d) => !compareDefinition(d, def)
      ),
    });
  }
  isDefined(def: string) {
    return this.book.definitions.some((d) => compareDefinition(d, def));
  }

  rangeToCfi(range: Range) {
    return this.view.contents.cfiFromRange(range);
  }

  keyword = "";
  setKeyword(keyword: string) {
    if (this.keyword === keyword) return;
    this.keyword = keyword;
    this.onKeywordChange();
  }

  // only use throttle/debounce for side effects
  async onKeywordChange() {
    this.results = await this.search();
  }

  get totalLength() {
    return this.sections?.reduce((acc, s) => acc + s.length, 0) ?? 0;
  }

  toggle(id: string) {
    const item = find(this.nav?.toc, id) as INavItem;
    if (item) item.expanded = !item.expanded;
  }

  toggleResult(id: string) {
    const item = find(this.results, id);
    if (item) item.expanded = !item.expanded;
  }

  showPrevLocation() {
    this.locationToReturn = this.location;
  }

  hidePrevLocation() {
    this.locationToReturn = undefined;
  }

  mapSectionToNavItem(sectionHref: string) {
    let navItem: NavItem | undefined;
    this.nav?.toc.forEach((item) =>
      dfs(item as NavItem, (i) => {
        if (compareHref(sectionHref, i.href)) navItem ??= i;
      })
    );
    return navItem;
  }

  get currentHref() {
    return this.location?.start.href;
  }

  get currentNavItem() {
    return this.section?.navitem;
  }

  get view() {
    return this.rendition?.manager?.views._views[0];
  }

  getNavPath(navItem = this.currentNavItem) {
    const path: INavItem[] = [];

    if (this.nav) {
      while (navItem) {
        path.unshift(navItem);
        const parentId = navItem.parent;
        if (!parentId) {
          navItem = undefined;
        } else {
          const index = (this.nav as any).tocById[parentId]!;
          navItem = (this.nav as any).getByIndex(parentId, index, this.nav.toc);
        }
      }
    }

    return path;
  }

  searchInSection(keyword = this.keyword, section = this.section) {
    if (!section) return;

    const subitems = section.find(keyword) as unknown as IMatch[];
    if (!subitems.length) return;

    const navItem = section.navitem;
    if (navItem) {
      const path = this.getNavPath(navItem);
      path.pop();
      return {
        id: navItem.href,
        excerpt: navItem.label,
        description: path.map((i) => i.label).join(" / "),
        subitems: subitems.map((i) => ({ ...i, id: i.cfi! })),
        expanded: true,
      };
    }
  }

  search(keyword = this.keyword) {
    // avoid blocking input
    return new Promise<IMatch[] | undefined>((resolve) => {
      requestIdleCallback(() => {
        if (!keyword) {
          resolve(undefined);
          return;
        }

        const results: IMatch[] = [];

        this.sections?.forEach((s) => {
          const result = this.searchInSection(keyword, s);
          if (result) results.push(result);
        });

        resolve(results);
      });
    });
  }

  private _el?: HTMLDivElement;
  onRender?: () => void;
  async render(
    el: HTMLDivElement,
    options?: {
      size?: {width: number, height: number},
      onRender?: (params: {
        prevLabel?: string;
        nextLabel?: string;
      }) => void;
    }
  ) {
    if (el === this._el) return;
    this._el = el;

    const file = await db?.files.get(this.book.id);
    if (!file) return;

    this.epub = await fileToEpub(file.file);

    this.epub.loaded.navigation.then((nav) => {
      this.nav = nav;
    });
    console.log(this.epub);
    this.epub.loaded.spine.then((spine: any) => {
      const sections = spine.spineItems as ISection[];
      // https://github.com/futurepress/epub.js/issues/887#issuecomment-700736486
      const promises = sections.map((s) =>
        s.load(this.epub?.load.bind(this.epub))
      );

      Promise.all(promises).then(() => {
        sections.forEach((s) => {
          s.length = s.document.body.textContent?.length ?? 0;
          s.images = [];
          s.document.querySelectorAll('img').forEach(el => {
            s.images.push(el.src);
          })
          // s.images = [...s.document.querySelectorAll("img")].map(
          //   (el) => el.src
          // );
          this.epub!.loaded.navigation.then(() => {
            s.navitem = this.mapSectionToNavItem(s.href);
          });
        });
        this.sections = sections;
      });
    });
    this.rendition = this.epub.renderTo(el, {
      // width: '90%',
      // height: '100%',
      // manager: "continuous",
      ...options.size,
      flow: "scrolled-doc",
      view: InlineView,
      allowScriptedContent: true,
    });

    console.log(this.rendition);

    this.rendition.display(
      this.location?.start.cfi ?? this.book.cfi ?? undefined
    );

    this.rendition.themes.default(defaultStyle);

    // this.rendition.hooks.render.register((view: any) => {
    //   console.log('hooks.render', view)
    //   this.onRender?.()
    // })

    this.rendition.on("relocated", (loc: Location) => {
      console.log("relocated", loc);
      this.rendered = true;
      this.timeline.unshift({
        location: loc,
        timestamp: Date.now(),
      });

      // calculate percentage
      if (this.sections) {
        const start = loc.start;
        const i = this.sections.findIndex((s) => s.href === start.href);
        const previousSectionsLength = this.sections
          .slice(0, i)
          .reduce((acc, s) => acc + s.length, 0);
        const previousSectionsPercentage =
          previousSectionsLength / this.totalLength;
        const currentSectionPercentage =
          this.sections[i]!.length / this.totalLength;
        const displayedPercentage =
          start.displayed.page / start.displayed.total;

        const percentage =
          previousSectionsPercentage +
          currentSectionPercentage * displayedPercentage;

        this.updateBook({ cfi: start.cfi, percentage });
      }
    });

    this.rendition.manager?.on('resized', (...args: []) => {
      console.log('manage resized:', args);
    })

    this.rendition.on('resized', (args: any) => {
      console.log('rendition resize:', args);
    })

    this.rendition.on("attached", (...args: any[]) => {
      console.log("attached", args);
    });
    this.rendition.on("started", (...args: any[]) => {
      console.log("started", args);
    });
    this.rendition.on("displayed", (...args: any[]) => {
      console.log("displayed", args);
    });
    this.rendition.on("rendered", (section: ISection, view: any) => {
      console.log("rendered", [section, view]);
      this.section = section;
      this.iframe = view.window as Window;
      // get 
      const nextSection = section.next();
      const prevSection = section.prev();
      const params = {nextLabel: '', prevLabel: ''};
      if (nextSection) {
        params.nextLabel = this.epub?.navigation.get(nextSection.href!).label ?? '';
      }
      if (prevSection) {
        params.prevLabel = this.epub?.navigation.get(prevSection.href!).label ?? '';
      }
      options?.onRender?.(params);
    });
    this.rendition.on("selected", (...args: any[]) => {
      console.log("selected", args);
    });
    this.rendition.on("removed", (...args: any[]) => {
      console.log("removed", args);
    });
    return this.rendition;
  }

  constructor(public book: BookRecord) {
    this.book = book;
    // don't subscribe `db.books` in `constructor`, it will
    // 1. update the unproxied instance, which is not reactive
    // 2. update unnecessary state (e.g. percentage) of all tabs with the same book
  }
}
