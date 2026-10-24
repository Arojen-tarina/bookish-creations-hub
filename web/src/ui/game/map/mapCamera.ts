import { useEffect, useMemo, useState } from 'react';
import type { Point } from '../../../game/model/models';

export interface Rect { left: number; top: number; right: number; bottom: number }
export interface Viewport { width: number; height: number }
export const PLAY_RECT: Rect = { left: 0, top: 20, right: 130, bottom: 110 };
export const MAX_ZOOM = 6;
export const mapImageRect = (_width: number, _height: number): Rect => ({ left: 0, top: 0, right: 130, bottom: 130 });

/** Pan/zoom camera in the board's 130-unit coordinate system. */
export class MapCameraState {
  viewport: Viewport = { width: 0, height: 0 };
  scale = 1;
  center: Point = { x: 65, y: 65 };
  bounds: Rect = PLAY_RECT;
  topInset = 0;
  rightInset = 0;
  ready = false;
  restored: boolean;
  private moved = false;
  private listeners = new Set<() => void>();
  private savedView: [number, number, number] | null;
  private animation = 0;

  constructor(savedView: [number, number, number] | null = null) {
    this.savedView = savedView;
    this.restored = savedView !== null;
  }
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private notify() { this.listeners.forEach((fn) => fn()); }
  dispose() { cancelAnimationFrame(this.animation); this.listeners.clear(); }
  get minScale() {
    if (!this.viewport.width || !this.viewport.height) return 1;
    const bw = this.bounds.right - this.bounds.left;
    const bh = this.bounds.bottom - this.bounds.top;
    return Math.min(this.viewport.width / bw, this.viewport.height / bh);
  }
  get maxScale() { return this.minScale * MAX_ZOOM; }
  get zoom() { return this.scale / this.minScale; }
  get visibleWorld(): Rect {
    const hw = this.viewport.width / (2 * this.scale), hh = this.viewport.height / (2 * this.scale);
    return { left: this.center.x - hw, right: this.center.x + hw, top: this.center.y - hh, bottom: this.center.y + hh };
  }
  setBounds(bounds: Rect) {
    this.bounds = bounds;
    if (!this.viewport.width) return;
    if (!this.moved) { this.scale = this.minScale; this.center = { x: 65, y: 65 }; }
    if (bounds !== PLAY_RECT) this.becomeReady();
    this.notify();
  }
  onViewportChanged(viewport: Viewport) {
    if (viewport.width <= 0 || viewport.height <= 0 || (viewport.width === this.viewport.width && viewport.height === this.viewport.height)) return;
    const oldZoom = this.ready ? this.zoom : 1;
    this.viewport = viewport;
    this.scale = this.minScale * oldZoom;
    this.clamp();
    this.notify();
  }
  private becomeReady() {
    if (this.savedView) {
      const [zoom, x, y] = this.savedView;
      this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.minScale * zoom));
      this.center = { x, y }; this.moved = true; this.savedView = null;
    }
    this.clamp(); this.ready = true;
  }
  saveView(): [number, number, number] | null { return this.ready ? [this.zoom, this.center.x, this.center.y] : null; }
  worldToScreen(p: Point): Point { return { x: (p.x - this.center.x) * this.scale + this.viewport.width / 2, y: (p.y - this.center.y) * this.scale + this.viewport.height / 2 }; }
  screenToWorld(p: Point): Point { return { x: (p.x - this.viewport.width / 2) / this.scale + this.center.x, y: (p.y - this.viewport.height / 2) / this.scale + this.center.y }; }
  transform(focus: Point, pan: Point, zoomBy: number) {
    cancelAnimationFrame(this.animation);
    this.moved = true;
    const world = this.screenToWorld(focus);
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * zoomBy));
    this.center = { x: world.x - (focus.x - this.viewport.width / 2) / this.scale - pan.x / this.scale, y: world.y - (focus.y - this.viewport.height / 2) / this.scale - pan.y / this.scale };
    this.clamp(); this.notify();
  }
  zoomBy(factor: number) { this.moved = true; this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor)); this.clamp(); this.notify(); }
  animateZoomBy(factor: number) { this.animateTo(this.scale * factor, this.center); }
  fit() { this.animateTo(this.minScale, { x: 65, y: 65 }); }
  setRightInset(px: number) { if (this.rightInset === px) return; this.rightInset = px; this.clamp(); this.notify(); }
  intoView(world: Point, force = false) {
    if (!this.viewport.width) return;
    const margin = this.viewport.height * .12, freeRight = this.viewport.width - this.rightInset;
    const s = this.worldToScreen(world), top = this.topInset + margin, bottom = this.viewport.height - margin;
    const xOk = s.x >= margin && s.x <= freeRight - margin, yOk = s.y >= top && s.y <= bottom;
    if (!force && xOk && yOk) return;
    const x = !force && xOk ? this.center.x : world.x - (freeRight / 2 - this.viewport.width / 2) / this.scale;
    const y = !force && yOk ? this.center.y : world.y - ((this.topInset + this.viewport.height) / 2 - this.viewport.height / 2) / this.scale;
    this.animateTo(this.scale, { x, y });
  }
  private animateTo(targetScale: number, targetCenter: Point) {
    cancelAnimationFrame(this.animation); this.moved = true;
    const startScale = this.scale, start = { ...this.center }, target = Math.max(this.minScale, Math.min(this.maxScale, targetScale)), began = performance.now();
    const frame = (now: number) => {
      const linear = Math.min(1, (now - began) / 300), eased = 1 - Math.pow(1 - linear, 3);
      this.scale = startScale + (target - startScale) * eased;
      this.center = { x: start.x + (targetCenter.x - start.x) * eased, y: start.y + (targetCenter.y - start.y) * eased };
      this.clamp(); this.notify();
      if (linear < 1) this.animation = requestAnimationFrame(frame);
    };
    this.animation = requestAnimationFrame(frame);
  }
  private clamp() {
    if (!this.viewport.width || !this.viewport.height) return;
    const hw = this.viewport.width / 2 / this.scale, hh = this.viewport.height / 2 / this.scale, inset = this.rightInset / this.scale;
    const minX = this.bounds.left + hw, maxX = this.bounds.right + inset - hw;
    const x = minX > maxX ? (this.bounds.left + this.bounds.right) / 2 + inset / 2 : Math.max(minX, Math.min(maxX, this.center.x));
    const minY = this.bounds.top + hh, maxY = this.bounds.bottom - hh;
    const y = minY > maxY ? (this.bounds.top + this.bounds.bottom) / 2 : Math.max(minY, Math.min(maxY, this.center.y));
    this.center = { x, y };
  }
}

export function useMapCamera() {
  const camera = useMemo(() => new MapCameraState(), []);
  const [, update] = useState(0);
  useEffect(() => { const unsubscribe = camera.subscribe(() => update((n) => n + 1)); return () => { unsubscribe(); camera.dispose(); }; }, [camera]);
  return camera;
}
