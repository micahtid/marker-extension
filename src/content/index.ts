import {
  initDB,
  saveAnnotations,
  loadAnnotations,
  generateId,
} from '../utils/storage';
import type { TextAnnotation, DrawAnnotation } from '../utils/storage';

// Inject styles dynamically
const styles = `
/* Main UI Container */
.annotate-saver-ui {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.annotate-saver-panel {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.05);
  padding: 14px;
  width: 260px;
}

.annotate-saver-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.annotate-saver-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.annotate-saver-close,
.annotate-saver-reset-all {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #999;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.annotate-saver-close:hover,
.annotate-saver-reset-all:hover {
  background: #f5f5f5;
  color: #333;
}

.annotate-saver-reset-all:hover {
  color: #dc2626;
}

/* Mode Toggle */
.annotate-mode-toggle {
  display: flex;
  background: #f5f5f7;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 14px;
}

.annotate-mode-btn {
  flex: 1;
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  transition: all 0.15s;
}

.annotate-mode-btn:hover {
  color: #333;
}

.annotate-mode-btn.active {
  background: #ffffff;
  color: #5046e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Draw Tools */
.annotate-draw-tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annotate-tool-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.annotate-tool-label {
  font-size: 12px;
  color: #888;
  min-width: 40px;
}

.annotate-color-picker {
  display: flex;
  gap: 6px;
}

.annotate-color-btn {
  width: 26px;
  height: 26px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
}

.annotate-color-btn:hover {
  transform: scale(1.15);
}

.annotate-color-btn.active {
  border-color: #333;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
}

.annotate-size-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e8e8e8;
  border-radius: 3px;
  outline: none;
}

.annotate-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #5046e5;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(80, 70, 229, 0.3);
}

.annotate-action-btns {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.annotate-action-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.annotate-action-btn.eraser {
  background: #f5f5f7;
  color: #555;
}

.annotate-action-btn.eraser:hover {
  background: #e8e8e8;
}

.annotate-action-btn.eraser.active {
  background: #5046e5;
  color: white;
}

.annotate-action-btn.reset {
  background: #fef2f2;
  color: #dc2626;
}

.annotate-action-btn.reset:hover {
  background: #fee2e2;
}


/* Text Selection Tooltip */
.annotate-text-tooltip {
  position: absolute;
  z-index: 2147483646;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
  padding: 8px;
  display: flex;
  gap: 4px;
}

.annotate-tooltip-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: #444;
}

.annotate-tooltip-btn:hover {
  background: #f5f5f7;
}

.annotate-tooltip-btn.active {
  background: #5046e5;
  color: white;
}

.annotate-tooltip-divider {
  width: 1px;
  background: #e8e8e8;
  margin: 6px 4px;
}

.annotate-color-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 10px;
  display: flex;
  gap: 6px;
  z-index: 2147483647;
}

/* Drawing Canvas */
.annotate-draw-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2147483640;
}

.annotate-draw-canvas.active {
  pointer-events: auto;
  cursor: crosshair;
}

.annotate-draw-canvas.eraser {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='%23666' stroke-width='1.5'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/svg%3E") 12 12, auto;
}

/* Text Annotations */
.annotate-highlight {
  /* Force inline to never break layout */
  display: inline !important;
  /* Minimal styling to avoid layout shifts */
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  /* No transitions to avoid performance issues */
  vertical-align: baseline !important;
  /* Preserve text flow */
  white-space: inherit !important;
  word-wrap: inherit !important;
  line-height: inherit !important;
}

.annotate-highlight[data-color="yellow"] {
  background-color: rgba(250, 204, 21, 0.4) !important;
}

.annotate-highlight[data-color="green"] {
  background-color: rgba(34, 197, 94, 0.35) !important;
}

.annotate-highlight[data-color="blue"] {
  background-color: rgba(59, 130, 246, 0.35) !important;
}

.annotate-highlight[data-color="pink"] {
  background-color: rgba(236, 72, 153, 0.35) !important;
}

.annotate-highlight[data-underline="true"] {
  text-decoration-line: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 2px !important;
}

.annotate-highlight[data-bold="true"] {
  font-weight: 700 !important;
}

.annotate-highlight[data-strikethrough="true"] {
  text-decoration-line: line-through !important;
  text-decoration-thickness: 2px !important;
}

.annotate-highlight[data-underline="true"][data-strikethrough="true"] {
  text-decoration-line: underline line-through !important;
  text-decoration-thickness: 2px !important;
}
`;

function injectStyles() {
  if (document.getElementById('annotate-saver-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'annotate-saver-styles';
  styleEl.textContent = styles;
  (document.head || document.documentElement).appendChild(styleEl);
}

type Mode = 'select' | 'draw';

interface DrawPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

class AnnotateSaver {
  private mode: Mode = 'select';
  private isActive = false;
  private uiContainer: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private tooltip: HTMLElement | null = null;

  // Drawing state
  private isDrawing = false;
  private isErasing = false;
  private currentPath: DrawPath | null = null;
  private drawPaths: DrawPath[] = [];
  private drawColor = '#5046e5';
  private drawWidth = 3;

  // Text annotations
  private textAnnotations: TextAnnotation[] = [];
  private selectedRange: Range | null = null;

  // Bound handlers for cleanup
  private boundHandleTextSelection: (e: MouseEvent) => void;
  private boundHandleSelectionChange: () => void;

  constructor() {
    this.boundHandleTextSelection = this.handleTextSelection.bind(this);
    this.boundHandleSelectionChange = this.handleSelectionChange.bind(this);
    this.init();
  }

  private async init() {
    injectStyles();
    await initDB();
    await this.loadSavedAnnotations();
    this.setupMessageListener();
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'TOGGLE_ANNOTATOR') {
        this.toggle();
      }
    });
  }

  private toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  private async loadSavedAnnotations() {
    try {
      const data = await loadAnnotations(window.location.href);
      if (data) {
        this.textAnnotations = data.textAnnotations || [];
        this.drawPaths = data.drawAnnotations.length > 0
          ? data.drawAnnotations[0].paths
          : [];

        // Restore text annotations
        this.restoreTextAnnotations();

        // Restore draw annotations
        if (this.drawPaths.length > 0) {
          this.ensureCanvas();
          this.redrawCanvas();
        }
      }
    } catch (err) {
      console.error('Failed to load annotations:', err);
    }
  }

  private restoreTextAnnotations() {
    this.textAnnotations.forEach(annotation => {
      try {
        const element = this.getElementByXPath(annotation.xpath);
        if (element) {
          this.applyTextAnnotation(element, annotation);
        }
      } catch (err) {
        console.error('Failed to restore annotation:', err);
      }
    });
  }

  private getElementByXPath(xpath: string): Node | null {
    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch {
      return null;
    }
  }

  private getXPath(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentNode;
      if (!parent) return '';
      const siblings = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
      const index = siblings.indexOf(node as ChildNode) + 1;
      return `${this.getXPath(parent)}/text()[${index}]`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const element = node as Element;
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parent = element.parentNode;
    if (!parent) return `/${element.tagName.toLowerCase()}`;

    const siblings = Array.from(parent.children).filter(
      e => e.tagName === element.tagName
    );
    const index = siblings.indexOf(element) + 1;

    return `${this.getXPath(parent)}/${element.tagName.toLowerCase()}[${index}]`;
  }

  private applyTextAnnotation(node: Node, annotation: TextAnnotation) {
    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent || '';
    const before = text.substring(0, annotation.startOffset);
    const highlighted = text.substring(annotation.startOffset, annotation.endOffset);
    const after = text.substring(annotation.endOffset);

    const wrapper = document.createElement('span');
    wrapper.className = 'annotate-highlight';
    wrapper.dataset.annotationId = annotation.id;

    if (annotation.style.color) {
      wrapper.dataset.color = annotation.style.color;
    }
    if (annotation.style.underline) {
      wrapper.dataset.underline = 'true';
    }
    if (annotation.style.bold) {
      wrapper.dataset.bold = 'true';
    }
    if (annotation.style.strikethrough) {
      wrapper.dataset.strikethrough = 'true';
    }

    wrapper.textContent = highlighted;

    const parent = node.parentNode;
    if (!parent) return;

    const fragment = document.createDocumentFragment();
    if (before) fragment.appendChild(document.createTextNode(before));
    fragment.appendChild(wrapper);
    if (after) fragment.appendChild(document.createTextNode(after));

    parent.replaceChild(fragment, node);
  }

  public activate() {
    this.isActive = true;
    injectStyles();
    this.createUI();
    this.updateModeState();
  }

  private updateModeState() {
    if (this.mode === 'draw') {
      this.ensureCanvas();
      this.canvas?.classList.add('active');
      document.removeEventListener('mouseup', this.boundHandleTextSelection);
      document.removeEventListener('selectionchange', this.boundHandleSelectionChange);
      this.hideTooltip();
    } else {
      this.canvas?.classList.remove('active');
      this.canvas?.classList.remove('eraser');
      this.isErasing = false;
      document.addEventListener('mouseup', this.boundHandleTextSelection);
      document.addEventListener('selectionchange', this.boundHandleSelectionChange);
    }
  }

  private createUI() {
    if (this.uiContainer) {
      this.updateUI();
      return;
    }

    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'annotate-saver-ui';
    this.uiContainer.innerHTML = this.getUIHTML();
    document.body.appendChild(this.uiContainer);

    this.attachUIListeners();
  }

  private getUIHTML(): string {
    return `
      <div class="annotate-saver-panel">
        <div class="annotate-saver-header">
          <div class="annotate-saver-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5046e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Marker
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="annotate-saver-reset-all" id="annotate-reset-all" title="Clear all annotations">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
            <button class="annotate-saver-close" id="annotate-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="annotate-mode-toggle">
          <button class="annotate-mode-btn ${this.mode === 'select' ? 'active' : ''}" data-mode="select">
            Select
          </button>
          <button class="annotate-mode-btn ${this.mode === 'draw' ? 'active' : ''}" data-mode="draw">
            Draw
          </button>
        </div>

        ${this.mode === 'draw' ? this.getDrawToolsHTML() : this.getSelectToolsHTML()}
      </div>
    `;
  }

  private getDrawToolsHTML(): string {
    const colors = ['#5046e5', '#ef4444', '#22c55e', '#f59e0b', '#1f2937'];
    return `
      <div class="annotate-draw-tools">
        <div class="annotate-tool-row">
          <span class="annotate-tool-label">Color</span>
          <div class="annotate-color-picker">
            ${colors.map(c => `
              <button class="annotate-color-btn ${this.drawColor === c ? 'active' : ''}"
                      data-color="${c}"
                      style="background: ${c}">
              </button>
            `).join('')}
          </div>
        </div>
        <div class="annotate-tool-row">
          <span class="annotate-tool-label">Size</span>
          <input type="range" class="annotate-size-slider"
                 min="1" max="20" value="${this.drawWidth}"
                 id="annotate-size">
        </div>
        <div class="annotate-action-btns">
          <button class="annotate-action-btn eraser ${this.isErasing ? 'active' : ''}" id="annotate-eraser">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1l10-10c.6-.6 1.5-.6 2.1 0l6 6c.6.6.6 1.5 0 2.1l-8 8"/>
            </svg>
            Eraser
          </button>
          <button class="annotate-action-btn reset" id="annotate-reset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
      </div>
    `;
  }

  private getSelectToolsHTML(): string {
    return `
      <div class="annotate-draw-tools">
        <div style="font-size: 11px; color: #888; padding: 4px 0 8px 0; line-height: 1.4;">
          Select any text on the page to highlight, underline, bold, or strikethrough
        </div>
      </div>
    `;
  }

  private updateUI() {
    if (!this.uiContainer) return;
    this.uiContainer.innerHTML = this.getUIHTML();
    this.attachUIListeners();
  }

  private attachUIListeners() {
    if (!this.uiContainer) return;

    // Close button
    const closeBtn = this.uiContainer.querySelector('#annotate-close');
    closeBtn?.addEventListener('click', () => this.deactivate());

    // Reset all button
    const resetAllBtn = this.uiContainer.querySelector('#annotate-reset-all');
    resetAllBtn?.addEventListener('click', () => this.resetAll());

    // Mode toggle
    const modeBtns = this.uiContainer.querySelectorAll('.annotate-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const newMode = target.dataset.mode as Mode;
        if (newMode !== this.mode) {
          this.mode = newMode;
          this.updateUI();
          this.updateModeState();
        }
      });
    });

    // Draw tools
    if (this.mode === 'draw') {
      // Color picker
      const colorBtns = this.uiContainer.querySelectorAll('.annotate-color-btn');
      colorBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLButtonElement;
          this.drawColor = target.dataset.color || '#5046e5';
          this.isErasing = false;
          this.updateUI();
          if (this.canvas) {
            this.canvas.classList.remove('eraser');
          }
        });
      });

      // Size slider
      const sizeSlider = this.uiContainer.querySelector('#annotate-size') as HTMLInputElement;
      sizeSlider?.addEventListener('input', (e) => {
        this.drawWidth = parseInt((e.target as HTMLInputElement).value);
      });

      // Eraser
      const eraserBtn = this.uiContainer.querySelector('#annotate-eraser');
      eraserBtn?.addEventListener('click', () => {
        this.isErasing = !this.isErasing;
        this.updateUI();
        if (this.canvas) {
          this.canvas.classList.toggle('eraser', this.isErasing);
        }
      });

      // Reset
      const resetBtn = this.uiContainer.querySelector('#annotate-reset');
      resetBtn?.addEventListener('click', () => this.resetDrawings());
    }
  }

  private ensureCanvas() {
    if (this.canvas) {
      this.resizeCanvas();
      return;
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'annotate-draw-canvas';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    // Canvas event listeners
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch support
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleMouseUp.bind(this));

    // Resize handler
    window.addEventListener('resize', () => this.resizeCanvas());

    // Redraw on scroll to keep paths in correct position
    window.addEventListener('scroll', () => this.redrawCanvas(), { passive: true });
  }

  private resizeCanvas() {
    if (!this.canvas) return;

    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    const docWidth = Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth
    );

    // Only resize if dimensions changed
    if (this.canvas.width !== docWidth || this.canvas.height !== docHeight) {
      this.canvas.width = docWidth;
      this.canvas.height = docHeight;
      this.canvas.style.width = `${docWidth}px`;
      this.canvas.style.height = `${docHeight}px`;
      this.redrawCanvas();
    }
  }

  private handleMouseDown(e: MouseEvent) {
    if (!this.canvas?.classList.contains('active')) return;
    e.preventDefault();

    this.isDrawing = true;
    const x = e.pageX;
    const y = e.pageY;

    if (this.isErasing) {
      this.eraseAtPoint(x, y);
    } else {
      this.currentPath = {
        points: [{ x, y }],
        color: this.drawColor,
        width: this.drawWidth,
      };
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isDrawing || !this.canvas) return;
    e.preventDefault();

    const x = e.pageX;
    const y = e.pageY;

    if (this.isErasing) {
      this.eraseAtPoint(x, y);
    } else if (this.currentPath) {
      this.currentPath.points.push({ x, y });
      this.redrawCanvas();
      this.drawPath(this.currentPath);
    }
  }

  private handleMouseUp() {
    if (this.currentPath && this.currentPath.points.length > 1) {
      this.drawPaths.push(this.currentPath);
      this.saveState();
    }
    this.isDrawing = false;
    this.currentPath = null;
  }

  private handleTouchStart(e: TouchEvent) {
    if (!this.canvas?.classList.contains('active')) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.handleMouseDown(mouseEvent);
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.handleMouseMove(mouseEvent);
  }

  private eraseAtPoint(x: number, y: number) {
    const eraserSize = 25;
    const before = this.drawPaths.length;

    this.drawPaths = this.drawPaths.filter(path => {
      return !path.points.some(point => {
        const dist = Math.sqrt(
          Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        return dist < eraserSize;
      });
    });

    if (this.drawPaths.length !== before) {
      this.redrawCanvas();
      this.saveState();
    }
  }

  private redrawCanvas() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPaths.forEach(path => this.drawPath(path));
  }

  private drawPath(path: DrawPath) {
    if (!this.ctx || path.points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = path.color;
    this.ctx.lineWidth = path.width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.moveTo(path.points[0].x, path.points[0].y);

    // Use quadratic curves for smoother lines
    for (let i = 1; i < path.points.length - 1; i++) {
      const xc = (path.points[i].x + path.points[i + 1].x) / 2;
      const yc = (path.points[i].y + path.points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
    }

    // Draw to the last point
    const last = path.points[path.points.length - 1];
    this.ctx.lineTo(last.x, last.y);

    this.ctx.stroke();
  }

  private resetDrawings() {
    this.drawPaths = [];
    this.redrawCanvas();
    this.saveState();
  }

  private resetAll() {
    // Confirm before clearing everything
    if (!confirm('Clear all annotations on this page? This cannot be undone.')) {
      return;
    }

    // Remove all text highlights from DOM
    document.querySelectorAll('.annotate-highlight').forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
        parent.normalize();
      }
    });

    // Clear all annotations
    this.textAnnotations = [];
    this.drawPaths = [];
    this.redrawCanvas();
    this.saveState();
  }

  private handleTextSelection(e: MouseEvent) {
    if (this.mode !== 'select' || !this.isActive) return;

    // Don't show tooltip if clicking on our UI
    if ((e.target as Element)?.closest('.annotate-saver-ui, .annotate-text-tooltip')) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      this.hideTooltip();
      return;
    }

    this.selectedRange = selection.getRangeAt(0).cloneRange();
    this.showTooltip(selection);
  }

  private handleSelectionChange() {
    if (this.mode !== 'select' || !this.isActive) return;

    // Auto-close tooltip when text is deselected
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      this.hideTooltip();
    }
  }

  private showTooltip(selection: Selection) {
    this.hideTooltip();

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check for existing annotation to show active states
    const existingHighlight = this.findExistingHighlight(range);
    let hasColor = false;
    let hasUnderline = false;
    let hasBold = false;
    let hasStrikethrough = false;

    if (existingHighlight) {
      hasColor = !!existingHighlight.dataset.color;
      hasUnderline = existingHighlight.dataset.underline === 'true';
      hasBold = existingHighlight.dataset.bold === 'true';
      hasStrikethrough = existingHighlight.dataset.strikethrough === 'true';
    }

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'annotate-text-tooltip';
    this.tooltip.innerHTML = `
      <button class="annotate-tooltip-btn ${hasColor ? 'active' : ''}" data-action="color" title="Highlight">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="2">
          <path d="M12 2L4 7l8 5 8-5-8-5z"/>
          <path d="M4 12l8 5 8-5"/>
          <path d="M4 17l8 5 8-5"/>
        </svg>
      </button>
      <button class="annotate-tooltip-btn ${hasUnderline ? 'active' : ''}" data-action="underline" title="Underline">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
          <line x1="4" y1="20" x2="20" y2="20"/>
        </svg>
      </button>
      <button class="annotate-tooltip-btn ${hasBold ? 'active' : ''}" data-action="bold" title="Bold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
        </svg>
      </button>
      <button class="annotate-tooltip-btn ${hasStrikethrough ? 'active' : ''}" data-action="strikethrough" title="Strikethrough">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="4" y1="12" x2="20" y2="12"/>
          <path d="M17.5 7.5c-1-1.5-3-2.5-5.5-2.5-3.3 0-6 2-6 5"/>
          <path d="M8.5 16.5c1 1.5 3 2.5 5.5 2.5 3.3 0 6-2 6-5"/>
        </svg>
      </button>
      <div class="annotate-tooltip-divider"></div>
      <button class="annotate-tooltip-btn" data-action="remove" title="Remove">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    // Position tooltip above the selection
    const left = rect.left + window.scrollX + (rect.width / 2) - 110;
    const top = rect.top + window.scrollY - 54;

    this.tooltip.style.left = `${Math.max(10, left)}px`;
    this.tooltip.style.top = `${Math.max(10, top)}px`;

    document.body.appendChild(this.tooltip);

    // Color dropdown state
    let colorDropdown: HTMLElement | null = null;

    // Add click handlers
    const buttons = this.tooltip.querySelectorAll('.annotate-tooltip-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = (e.currentTarget as HTMLElement).dataset.action;

        if (action === 'color') {
          if (colorDropdown) {
            colorDropdown.remove();
            colorDropdown = null;
          } else {
            colorDropdown = this.showColorDropdown(btn as HTMLElement);
          }
        } else if (action === 'remove') {
          this.removeAnnotation();
        } else {
          this.applyStyle(action as string);
        }
      });
    });
  }

  private showColorDropdown(anchor: HTMLElement): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className = 'annotate-color-dropdown';

    const colors = [
      { name: 'yellow', color: '#facc15' },
      { name: 'green', color: '#22c55e' },
      { name: 'blue', color: '#3b82f6' },
      { name: 'pink', color: '#ec4899' },
    ];

    colors.forEach(({ name, color }) => {
      const btn = document.createElement('button');
      btn.className = 'annotate-color-btn';
      btn.style.background = color;
      btn.dataset.colorName = name;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyStyle('color', name);
        dropdown.remove();
      });
      dropdown.appendChild(btn);
    });

    // Get tooltip position to align dropdown with it
    const tooltipRect = this.tooltip?.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();

    dropdown.style.position = 'fixed';
    // Left-align with the tooltip, not the button
    dropdown.style.left = tooltipRect ? `${tooltipRect.left}px` : `${anchorRect.left}px`;
    // Add more spacing between tooltip and dropdown (12px instead of 6px)
    dropdown.style.top = `${anchorRect.bottom + 12}px`;

    document.body.appendChild(dropdown);
    return dropdown;
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    // Also remove any color dropdowns
    document.querySelectorAll('.annotate-color-dropdown').forEach(el => el.remove());
  }

  private applyStyle(action: string, colorName?: string) {
    if (!this.selectedRange) return;

    const selection = window.getSelection();
    if (!selection) return;

    // Check if we're modifying an existing annotation
    const existingHighlight = this.findExistingHighlight(this.selectedRange);

    if (existingHighlight) {
      // Update existing annotation
      const annotationId = existingHighlight.dataset.annotationId;
      const annotation = this.textAnnotations.find(a => a.id === annotationId);

      if (annotation) {
        switch (action) {
          case 'color':
            if (colorName) {
              annotation.style.color = colorName;
              existingHighlight.dataset.color = colorName;
            } else {
              annotation.style.color = undefined;
              delete existingHighlight.dataset.color;
            }
            break;
          case 'underline':
            annotation.style.underline = !annotation.style.underline;
            if (annotation.style.underline) {
              existingHighlight.dataset.underline = 'true';
            } else {
              delete existingHighlight.dataset.underline;
            }
            break;
          case 'bold':
            annotation.style.bold = !annotation.style.bold;
            if (annotation.style.bold) {
              existingHighlight.dataset.bold = 'true';
            } else {
              delete existingHighlight.dataset.bold;
            }
            break;
          case 'strikethrough':
            annotation.style.strikethrough = !annotation.style.strikethrough;
            if (annotation.style.strikethrough) {
              existingHighlight.dataset.strikethrough = 'true';
            } else {
              delete existingHighlight.dataset.strikethrough;
            }
            break;
        }

        // Check if annotation has no styles left, remove it entirely
        if (!annotation.style.color && !annotation.style.underline &&
            !annotation.style.bold && !annotation.style.strikethrough) {
          this.removeAnnotation();
          return;
        }

        this.saveState();
      }
    } else {
      // Create new annotation
      const baseId = generateId();
      const style = {
        color: action === 'color' ? colorName : undefined,
        underline: action === 'underline',
        bold: action === 'bold',
        strikethrough: action === 'strikethrough',
      };

      // Wrap the selection
      const wrapper = document.createElement('span');
      wrapper.className = 'annotate-highlight';
      wrapper.dataset.annotationId = baseId;

      if (style.color) {
        wrapper.dataset.color = style.color;
      }
      if (style.underline) {
        wrapper.dataset.underline = 'true';
      }
      if (style.bold) {
        wrapper.dataset.bold = 'true';
      }
      if (style.strikethrough) {
        wrapper.dataset.strikethrough = 'true';
      }

      // Use safe wrapping method that won't break layouts
      const wrappedNodes = this.safeWrapSelectionWithTracking(this.selectedRange, wrapper, style, baseId);

      if (wrappedNodes.length > 0) {
        // Add all wrapped node annotations to our tracking
        this.textAnnotations.push(...wrappedNodes);
        this.saveState();
      } else {
        console.error('Failed to safely wrap selection - selection may span incompatible elements');
      }
    }

    selection.removeAllRanges();
    this.hideTooltip();
    this.selectedRange = null;
  }

  private safeWrapSelectionWithTracking(
    range: Range,
    wrapperTemplate: HTMLElement,
    style: TextAnnotation['style'],
    baseId: string
  ): TextAnnotation[] {
    try {
      // Get all text nodes in the selection
      const textNodes = this.getTextNodesInRange(range);

      if (textNodes.length === 0) {
        console.warn('No text nodes found in selection');
        return [];
      }

      const annotations: TextAnnotation[] = [];
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      for (let i = 0; i < textNodes.length; i++) {
        const textNode = textNodes[i];
        const text = textNode.textContent || '';
        if (!text) continue;

        const parent = textNode.parentNode;
        if (!parent) continue;

        // Create a new wrapper for this text node (clone the template)
        const wrapper = wrapperTemplate.cloneNode(false) as HTMLElement;

        let startIdx = 0;
        let endIdx = text.length;

        // First text node - use startOffset
        if (textNode === startContainer && startContainer.nodeType === Node.TEXT_NODE) {
          startIdx = startOffset;
        }

        // Last text node - use endOffset
        if (textNode === endContainer && endContainer.nodeType === Node.TEXT_NODE) {
          endIdx = endOffset;
        }

        // Get the text to wrap
        const beforeText = text.substring(0, startIdx);
        const selectedText = text.substring(startIdx, endIdx);
        const afterText = text.substring(endIdx);

        // Skip if no actual text selected (but allow whitespace if user selected it)
        if (!selectedText || selectedText.length === 0) continue;

        // Create the annotation record for this text node
        const annotation: TextAnnotation = {
          id: `${baseId}_${i}`,
          type: 'text',
          text: selectedText,
          startOffset: startIdx,
          endOffset: endIdx,
          xpath: this.getXPath(textNode),
          style: { ...style },
        };

        // Create the wrapped structure
        const fragment = document.createDocumentFragment();

        if (beforeText) {
          fragment.appendChild(document.createTextNode(beforeText));
        }

        wrapper.appendChild(document.createTextNode(selectedText));
        fragment.appendChild(wrapper);

        if (afterText) {
          fragment.appendChild(document.createTextNode(afterText));
        }

        // Replace the text node
        try {
          parent.replaceChild(fragment, textNode);
          annotations.push(annotation);
        } catch (err) {
          console.error('Failed to replace text node:', err);
        }
      }

      return annotations;
    } catch (err) {
      console.error('Error in safeWrapSelectionWithTracking:', err);
      return [];
    }
  }

  private getTextNodesInRange(range: Range): Text[] {
    const textNodes: Text[] = [];

    // Handle single text node case directly (most common)
    if (range.startContainer === range.endContainer &&
        range.startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = range.startContainer as Text;
      if (textNode.textContent &&
          range.endOffset > range.startOffset) {
        textNodes.push(textNode);
      }
      return textNodes;
    }

    // Handle multiple text nodes using TreeWalker
    const commonAncestor = range.commonAncestorContainer;
    const walker = document.createTreeWalker(
      commonAncestor,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        // Check if this node is actually within our range
        try {
          if (range.intersectsNode(textNode)) {
            textNodes.push(textNode);
          }
        } catch (e) {
          // Some browsers have issues with intersectsNode, use alternative check
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(textNode);

          // Check if ranges overlap
          if (range.compareBoundaryPoints(Range.END_TO_START, nodeRange) <= 0 &&
              range.compareBoundaryPoints(Range.START_TO_END, nodeRange) >= 0) {
            textNodes.push(textNode);
          }
        }
      }
      node = walker.nextNode();
    }

    return textNodes;
  }

  private findExistingHighlight(range: Range): HTMLElement | null {
    let node: Node | null = range.startContainer;
    while (node) {
      if (node instanceof HTMLElement && node.classList.contains('annotate-highlight')) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  private removeAnnotation() {
    if (!this.selectedRange) return;

    const highlight = this.findExistingHighlight(this.selectedRange);
    if (highlight) {
      const annotationId = highlight.dataset.annotationId;

      // Remove from state
      this.textAnnotations = this.textAnnotations.filter(a => a.id !== annotationId);

      // Unwrap the element
      const parent = highlight.parentNode;
      if (parent) {
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
        parent.normalize();
      }

      this.saveState();
    }

    window.getSelection()?.removeAllRanges();
    this.hideTooltip();
    this.selectedRange = null;
  }

  private async saveState() {
    try {
      const drawAnnotation: DrawAnnotation = {
        id: 'draw_main',
        type: 'draw',
        paths: this.drawPaths,
      };

      await saveAnnotations(
        window.location.href,
        this.textAnnotations,
        this.drawPaths.length > 0 ? [drawAnnotation] : []
      );
    } catch (err) {
      console.error('Failed to save annotations:', err);
    }
  }

  private deactivate() {
    this.isActive = false;
    this.hideTooltip();

    document.removeEventListener('mouseup', this.boundHandleTextSelection);
    document.removeEventListener('selectionchange', this.boundHandleSelectionChange);

    if (this.canvas) {
      this.canvas.classList.remove('active');
      this.canvas.classList.remove('eraser');
    }

    if (this.uiContainer) {
      this.uiContainer.remove();
      this.uiContainer = null;
    }

    this.isErasing = false;
  }
}

// Initialize
new AnnotateSaver();
