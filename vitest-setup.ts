import { $TSFixMe } from '@/src';
import '@/src/tests/server';
import '@testing-library/jest-dom/vitest';

// Mock PointerEvent to enable testing interactions with the select component
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

global.ResizeObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Add these mocks for pdfjs-dist
// Mock DOMMatrix which is required by pdfjs
global.DOMMatrix = class DOMMatrix {
  constructor() {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
      m11: 1,
      m12: 0,
      m13: 0,
      m14: 0,
      m21: 0,
      m22: 1,
      m23: 0,
      m24: 0,
      m31: 0,
      m32: 0,
      m33: 1,
      m34: 0,
      m41: 0,
      m42: 0,
      m43: 0,
      m44: 1,
      is2D: true,
      isIdentity: true,
      inverse: vi.fn(),
      multiply: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
    };
  }
} as $TSFixMe;

// Mock Path2D which is required by pdfjs canvas operations
global.Path2D = class Path2D {
  constructor() {}
  addPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  arcTo() {}
  ellipse() {}
  rect() {}
} as $TSFixMe;

// Mock canvas 2d context methods that pdfjs uses
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as $TSFixMe;

// Mock worker for pdfjs (it tries to create web workers)
if (typeof window !== 'undefined') {
  // @ts-expect-error - Worker is not defined in the global scope
  window.Worker = class Worker {
    constructor() {
      return {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    }
  };
}

// Mock matchMedia which is used by Radix UI components like Drawer
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
