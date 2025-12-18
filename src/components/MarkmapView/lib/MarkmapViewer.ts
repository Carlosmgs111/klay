import "markmap-toolbar/dist/style.css";
import { currentMindmap } from "../../../stores/currentMindmap";
import { Transformer } from "markmap-lib";
import { Markmap, loadCSS, loadJS, deriveOptions } from "markmap-view";
import { shuffleArray } from "../../../utils/shuffleArray";
import colors from "./colors.neon.v1.json";

export class MarkMapViewer {
  private container: HTMLElement;
  private svg: SVGElement;
  private markmap: any = null;
  private transformer: Transformer;
  private emptyState: HTMLElement;
  private unsubscribe: (() => void) | null = null;
  private isInitialized: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.svg = container.querySelector(".markmap-svg") as SVGElement;
    this.emptyState = container.querySelector(".empty-state") as HTMLElement;
    this.transformer = new Transformer();
    this.init();
    this.setupControls();
  }

  private init() {
    this.unsubscribe = currentMindmap.subscribe((markdown: string | null) => {
      console.log(markdown);
      if (markdown && markdown.toString().trim()) {
        this.render(markdown);
      } else {
        this.showEmptyState();
      }

      if (markdown && markdown.toString().trim()) {
        this.render(markdown);
      } else {
        this.showEmptyState();
      }
    });
  }

  private showEmptyState() {
    this.emptyState.classList.remove("opacity-0");
    this.emptyState.classList.add("opacity-100");

    if (this.markmap) {
      this.svg.innerHTML = "";
      this.markmap.destroy();
      this.markmap = null;
      this.isInitialized = false;
    }
  }

  private hideEmptyState() {
    this.emptyState.classList.remove("opacity-100");
    this.emptyState.classList.add("opacity-0");
  }

  private injectStyles(svgElement: any, styles: any = "") {
    styles;
    if (!svgElement) return;
    const observer = new MutationObserver((mutations) => {
      if (!mutations.length) return;
      mutations.forEach((mutation) => {
        if (!mutation.addedNodes.length) return;
      });
      const links = svgElement.querySelectorAll("a");
      if (!links.length) return;
      links.forEach((link: any) => {
        link.setAttribute("target", "_blank");
      });
    });
    observer.observe(svgElement, {
      childList: true,
      subtree: true,
    });
    const style = document.createElement("style");
    style.textContent = ``;
    svgElement.setAttribute("data-type", "markmap");
    svgElement.appendChild(style);
  }

  private async loadAssets(assets: any) {
    const { styles, scripts } = assets;

    loadCSS(styles);
    loadJS(scripts);

    if (styles) {
      for (const style of styles) {
        if (document.querySelector(`link[href="${style.url}"]`)) {
          continue;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = style.url;
        document.head.appendChild(link);
      }
    }

    if (scripts) {
      for (const script of scripts) {
        if (document.querySelector(`script[src="${script.url}"]`)) {
          continue;
        }

        await new Promise((resolve, reject) => {
          const scriptEl = document.createElement("script");
          scriptEl.src = script.url;
          scriptEl.onload = resolve;
          scriptEl.onerror = reject;
          // document.head.appendChild(scriptEl);
        });
      }
    }
  }

  public async render(markdown: string) {
    if (!markdown || markdown.trim() === "") {
      this.showEmptyState();
      return;
    }
    this.injectStyles(this.svg);
    this.hideEmptyState();

    try {
      const { root, features } = this.transformer.transform(markdown);

      const assets = this.transformer.getUsedAssets(features);
      if (assets.styles?.length || assets.scripts?.length) {
        await this.loadAssets(assets);
      }

      const options = deriveOptions({
        duration: 300,
        maxWidth: 300,
        paddingX: 8,
        spacingVertical: 5,
        spacingHorizontal: 80,
        nodeMinHeight: 16,
        initialExpandLevel: -1,
        fitRatio: 0.95,
        color: shuffleArray(colors.map(({ hex }) => hex)),
        // colorFreezeLevel: 2,
      });

      if (!this.markmap || !this.isInitialized) {
        this.markmap = Markmap.create(
          this.svg,
          { ...options, autoFit: true },
          root
        );

        this.isInitialized = true;
        setTimeout(() => {
          if (this.markmap) {
            this.markmap.fit();
          }
        }, 100);
      } else {
        this.markmap.setData(root);
        setTimeout(() => {
          if (this.markmap) {
            this.markmap.fit();
          }
        }, 100);
      }
    } catch (error) {
      this.showEmptyState();
    }
  }

  private setupControls() {
    const zoomInBtn = this.container.querySelector(
      ".zoom-in"
    ) as HTMLButtonElement;
    const zoomOutBtn = this.container.querySelector(
      ".zoom-out"
    ) as HTMLButtonElement;
    const fitViewBtn = this.container.querySelector(
      ".fit-view"
    ) as HTMLButtonElement;
    const resetViewBtn = this.container.querySelector(
      ".reset-view"
    ) as HTMLButtonElement;

    zoomInBtn?.addEventListener("click", () => {
      if (this.markmap) {
        this.markmap.rescale(1.2);
      }
    });

    zoomOutBtn?.addEventListener("click", () => {
      if (this.markmap) {
        this.markmap.rescale(0.8);
      }
    });

    fitViewBtn?.addEventListener("click", () => {
      if (this.markmap) {
        this.markmap.fit();
      }
    });

    resetViewBtn?.addEventListener("click", () => {
      if (this.markmap) {
        const currentValue = currentMindmap.get();
        if (currentValue) {
          this.markmap.destroy();
          this.markmap = null;
          this.isInitialized = false;
          this.render(currentValue);
        }
      }
    });
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.markmap) {
      this.markmap.destroy();
      this.markmap = null;
      this.isInitialized = false;
    }
  }
}
