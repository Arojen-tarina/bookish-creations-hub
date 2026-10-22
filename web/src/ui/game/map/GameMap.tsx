import { useEffect, useRef } from 'react';
import type { Army, BuildingType, GameState, Point, Province } from '../../../game/model/models';
import type { FactionId } from '../../../game/model/enums';
import { asset } from '../../../assets';
import { factionColor, factionSprite, resourceSprite } from '../factionStyle';
import { MapCameraState, mapImageRect } from './mapCamera';

const S = 1.15, TOKEN_R = 1.45 * S, TOKEN_HIT = 3.6;
const imageCache = new Map<string, HTMLImageElement>();
function image(path: string): HTMLImageElement {
  let img = imageCache.get(path);
  if (!img) { img = new Image(); img.src = asset(path); imageCache.set(path, img); }
  return img;
}

function drawGlyph(ctx: CanvasRenderingContext2D, kind: 'crown' | 'shield' | 'horseshoe' | 'sword', x: number, y: number, w: number, h: number, fill: string, stroke?: string, strokeWidth = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(w, h); ctx.beginPath();
  if (kind === 'crown') {
    ctx.moveTo(.06,.88); ctx.lineTo(.94,.88); ctx.lineTo(.94,.72); ctx.lineTo(1,.22); ctx.lineTo(.72,.5); ctx.lineTo(.5,.08); ctx.lineTo(.28,.5); ctx.lineTo(0,.22); ctx.lineTo(.06,.72); ctx.closePath();
  } else if (kind === 'shield') {
    ctx.moveTo(.5,.02); ctx.lineTo(.92,.16); ctx.lineTo(.88,.52); ctx.quadraticCurveTo(.8,.86,.5,.98); ctx.quadraticCurveTo(.2,.86,.12,.52); ctx.lineTo(.08,.16); ctx.closePath();
  } else if (kind === 'horseshoe') {
    ctx.moveTo(.18,.95); ctx.lineTo(.18,.45); ctx.bezierCurveTo(.18,.05,.82,.05,.82,.45); ctx.lineTo(.82,.95); ctx.lineTo(.62,.95); ctx.lineTo(.62,.45); ctx.bezierCurveTo(.62,.27,.38,.27,.38,.45); ctx.lineTo(.38,.95); ctx.closePath();
  } else {
    const poly = (pts: Array<[number, number]>) => { ctx.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]); ctx.closePath(); };
    poly([[.98,.02],[.9,.26],[.42,.74],[.26,.58],[.74,.1]]); poly([[.14,.56],[.24,.46],[.54,.76],[.44,.86]]); poly([[.3,.62],[.38,.7],[.16,.92],[.08,.84]]); ctx.moveTo(.14,.92); ctx.arc(.08,.92,.06,0,Math.PI*2);
  }
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth / Math.max(1, Math.min(w,h)); ctx.stroke(); }
  ctx.restore();
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string, lineWidth = 1) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}
function drawSprite(ctx: CanvasRenderingContext2D, path: string, x: number, y: number, w: number, h: number) {
  const im = image(path); if (!im.complete || !im.naturalWidth) return;
  const scale = Math.min(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * scale, dh = im.naturalHeight * scale;
  ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function provincePoint(p: Province): Point { return p.center; }
interface Badge { province: Province; armies: Army[]; owner: FactionId; player: boolean; cavalry: number; infantry: number; chief: boolean; kind: 'leader' | 'cavalry' | 'infantry'; x: number; y: number; w: number; h: number }
function getBadges(state: GameState): Badge[] {
  const byProvince = new Map<string, Army[]>();
  state.armies.forEach((army) => byProvince.set(army.provinceId, [...(byProvince.get(army.provinceId) ?? []), army]));
  const groups: Army[][] = [];
  for (const armies of byProvince.values()) {
    const own = armies.filter((army) => army.ownerId === state.playerFactionId);
    const rival = armies.filter((army) => army.ownerId !== state.playerFactionId);
    if (own.length) groups.push(own);
    if (rival.length) groups.push(rival);
  }
  const result: Badge[] = [];
  for (const armies of groups) {
    const p = state.provinces.find((x) => x.id === armies[0].provinceId); if (!p) continue;
    const cavalry = armies.reduce((sum, a) => sum + a.cavalry, 0), infantry = armies.reduce((sum, a) => sum + a.infantry, 0);
    const chief = armies.some((a) => a.id === `army-${a.ownerId}-main` || a.leaderBonus > 0);
    const kind = chief ? 'leader' : cavalry >= infantry && cavalry > 0 ? 'cavalry' : 'infantry';
    const w = (kind === 'leader' ? 4.6 : 5.4) * S, h = (kind === 'leader' ? 4.2 : 3.9) * S;
    const player = armies[0].ownerId === state.playerFactionId;
    const angle = player ? 315 : 135, rad = angle * Math.PI / 180;
    const dist = TOKEN_R + (p.isCapital ? .5 : 0) + h / 2 + .2 * S;
    result.push({ province: p, armies, owner: armies[0].ownerId, player, cavalry, infantry, chief, kind, x: p.center.x + Math.cos(rad) * dist, y: p.center.y + Math.sin(rad) * dist, w, h });
  }
  return result;
}

export interface GameMapProps {
  state: GameState; selectedProvinceId: string | null; selectedArmyId: string | null;
  moveTargets: ReadonlySet<string>; attackTargets: ReadonlySet<string>;
  onProvinceTap: (id: string) => void; onArmyTap: (id: string) => void;
  camera: MapCameraState; className?: string;
}
/** Board art, province tokens and army stacks with touch pan/pinch, wheel zoom, and selection. */
export function GameMap({ state, selectedProvinceId, selectedArmyId, moveTargets, attackTargets, onProvinceTap, onArmyTap, camera, className }: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gesture = useRef<{ points: Map<number, Point>; last: Point | null; initialDistance: number; dragged: boolean }>({ points: new Map(), last: null, initialDistance: 0, dragged: false });
  const latest = useRef({ state, selectedProvinceId, selectedArmyId, moveTargets, attackTargets, onProvinceTap, onArmyTap });
  latest.current = { state, selectedProvinceId, selectedArmyId, moveTargets, attackTargets, onProvinceTap, onArmyTap };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr)); canvas.height = Math.max(1, Math.round(rect.height * dpr));
      camera.onViewportChanged({ width: rect.width, height: rect.height });
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    return () => observer.disconnect();
  }, [camera]);

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
    let frame = 0; let raf = 0;
    const boardPath = 'board_map.jpg', board = image(boardPath);
    const boardLoaded = () => { if (board.naturalWidth) { camera.setBounds(mapImageRect(board.naturalWidth, board.naturalHeight)); } };
    board.addEventListener('load', boardLoaded); boardLoaded();
    const render = (time: number) => {
      raf = requestAnimationFrame(render);
      const dpr = window.devicePixelRatio || 1, { width, height } = camera.viewport;
      if (!width || !height) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#14120f'; ctx.fillRect(0, 0, width, height);
      const ir = board.naturalWidth ? mapImageRect(board.naturalWidth, board.naturalHeight) : { left: 0, top: 0, right: 130, bottom: 130 };
      if (board.complete && board.naturalWidth) {
        const v = camera.visibleWorld, l = Math.max(v.left, ir.left), t = Math.max(v.top, ir.top), r = Math.min(v.right, ir.right), b = Math.min(v.bottom, ir.bottom);
        if (r > l && b > t) {
          const px = board.naturalWidth / (ir.right - ir.left), dst = camera.worldToScreen({ x: l, y: t }), br = camera.worldToScreen({ x: r, y: b });
          ctx.drawImage(board, (l - ir.left) * px, (t - ir.top) * px, (r - l) * px, (b - t) * px, dst.x, dst.y, br.x - dst.x, br.y - dst.y);
        }
      }
      const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * .75);
      vignette.addColorStop(0, 'rgba(18,15,12,0)'); vignette.addColorStop(1, 'rgba(18,15,12,.45)'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);
      const k = camera.scale, pulse = .35 + .6 * (.5 + .5 * Math.sin(time / 900 * Math.PI));
      const shown = latest.current, visible = camera.visibleWorld;
      const provinces = shown.state.provinces.filter((p) => p.center.x >= visible.left - 10 && p.center.x <= visible.right + 10 && p.center.y >= visible.top - 10 && p.center.y <= visible.bottom + 10);
      for (const p of provinces) {
        const c = camera.worldToScreen(p.center), r = (TOKEN_R + (p.isCapital ? .5 * S : 0)) * k;
        const target = shown.attackTargets.has(p.id) ? '#ef4444' : shown.moveTargets.has(p.id) ? '#22c55e' : null;
        if (target) disc(ctx, c.x, c.y, r + 1.4 * S * k, `${target}38`);
        disc(ctx, c.x + .3 * S * k, c.y + .3 * S * k, r, '#0006');
        disc(ctx, c.x, c.y, r, `${factionColor(p.ownerId)}eb`, shown.selectedProvinceId === p.id ? '#fbbf24' : target ?? '#1a1a1a', (shown.selectedProvinceId === p.id ? .6 : target ? .45 : .3) * S * k);
        disc(ctx, c.x - r * .22, c.y - r * .22, r * .55, '#ffffff29');
        if (shown.selectedProvinceId === p.id) disc(ctx, c.x, c.y, r + .8 * S * k, '#fbbf2400', `#fbbf24${Math.round(pulse * 255).toString(16).padStart(2, '0')}`, .28 * S * k);
        if (p.isCapital || p.garrison > 0) {
          const size = (p.isCapital ? 1.9 : 1.3) * S * k;
          drawGlyph(ctx, p.isCapital ? 'crown' : 'shield', c.x - size / 2, c.y - size / 2, size, size * .85, p.isCapital ? '#fbbf24' : '#ffffff', '#1a1a1a', .1 * S * k);
        }
        if (p.hasSilkRoad) disc(ctx, c.x + r * .6, c.y + r * .6, .5 * S * k, '#f59e0b', '#92400e', .1 * S * k);
      }
      for (const p of provinces) {
        const c = camera.worldToScreen(p.center), r = (TOKEN_R + (p.isCapital ? .5 * S : 0)) * k;
        if (p.fortLevel > 0) drawSprite(ctx, factionSprite('fort', p.ownerId), c.x - 2.9 * S * k, c.y - r - (2.9 + p.fortLevel * .35) * S * k + .2 * k, (4.3 + p.fortLevel * .5) * S * k, (2.9 + p.fortLevel * .35) * S * k);
        const buildings = shown.state.buildings[p.id] ?? [];
        if (buildings.includes('camp')) drawSprite(ctx, factionSprite('camp', p.ownerId), c.x - r - 4.6 * S * k, c.y - r * .4, 4.6 * S * k, 3 * S * k);
        if (buildings.includes('bridge')) drawSprite(ctx, factionSprite('bridge', p.ownerId), c.x + r * .55, c.y + r * .25, 4.4 * S * k, 2.5 * S * k);
        if (p.tradeGood) drawSprite(ctx, resourceSprite(p.tradeGood), c.x - r - 2 * S * k, c.y - r - 1.4 * S * k, 2 * S * k, 2.8 * S * k);
      }
      for (const badge of getBadges(shown.state)) {
        if (badge.x < visible.left - 10 || badge.x > visible.right + 10 || badge.y < visible.top - 10 || badge.y > visible.bottom + 10) continue;
        const c = camera.worldToScreen({ x: badge.x, y: badge.y }), w = badge.w * k, h = badge.h * k, color = factionColor(badge.owner);
        ctx.fillStyle = `${color}59`; ctx.beginPath(); ctx.ellipse(c.x, c.y, w * .46, h * .44, 0, 0, Math.PI * 2); ctx.fill();
        const path = factionSprite(badge.kind, badge.owner); drawSprite(ctx, path, c.x - w / 2, c.y - h / 2, w, h);
        if (badge.chief) { const cw = 1.5 * S * k; drawGlyph(ctx, 'crown', c.x - cw / 2, c.y - h * .42 - cw * .8, cw, cw * .8, '#fbbf24', '#1a1a1a', .1 * S * k); }
        const parts = [{ kind: 'horseshoe' as const, count: badge.cavalry }, { kind: 'sword' as const, count: badge.infantry }].filter((part) => part.count > 0);
        if (parts.length) {
          const pillH = 1.5 * S * k, glyph = pillH * .62, gap = pillH * .18, py = c.y + h / 2 + .1 * S * k;
          ctx.font = `bold ${Math.max(7, 1.1 * S * k)}px sans-serif`;
          const widths = parts.map((part) => ctx.measureText(String(part.count)).width), contentW = parts.reduce((sum, _part, i) => sum + glyph + gap + widths[i], 0) + gap * 2 * (parts.length - 1), pillW = contentW + pillH * .6, left = c.x - pillW / 2;
          ctx.fillStyle = '#1a1a1acc'; ctx.beginPath(); ctx.roundRect(left, py, pillW, pillH, pillH / 2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = .12 * S * k; ctx.stroke();
          let x = left + pillH * .3; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          parts.forEach((part, i) => { drawGlyph(ctx, part.kind, x, py + (pillH - glyph) / 2, glyph, glyph, '#fff'); x += glyph + gap; ctx.fillText(String(part.count), x, py + pillH / 2); x += widths[i] + gap * 2; });
        }
        if (badge.player) {
          const selected = badge.armies.some((a) => a.id === shown.selectedArmyId);
          disc(ctx, c.x + w * .42, c.y - h * .42, .4 * S * k, badge.armies.every((a) => a.movementLeft <= 0) ? '#ef4444' : badge.armies.some((a) => a.movementLeft <= 0) ? '#eab308' : '#22c55e');
          if (selected) disc(ctx, c.x, c.y, Math.max(w, h) * .67 + pulse * .5, '#fbbf2400', `#fbbf24${Math.round(pulse * 255).toString(16).padStart(2, '0')}`, .35 * S * k);
        }
        if (badge.armies.length > 1) { disc(ctx, c.x - w * .42, c.y - h * .38, .55 * S * k, '#1a1a1a', '#fbbf24', .1 * S * k); ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${Math.max(7, 1.0 * S * k)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(badge.armies.length), c.x - w * .42, c.y - h * .38); }
      }
      if (camera.zoom >= 1.8) for (const p of provinces) {
        const c = camera.worldToScreen(p.center), font = Math.max(9, Math.min(14, .75 * S * k));
        ctx.font = `bold ${font}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const y = c.y + TOKEN_R * k + .25 * S * k, labelW = ctx.measureText(p.name).width, h = font * 1.15;
        ctx.fillStyle = 'rgba(18,15,12,.7)'; ctx.beginPath(); ctx.roundRect(c.x - labelW / 2 - h * .15, y, labelW + h * .3, h, h / 2); ctx.fill();
        ctx.fillStyle = '#f5e6c8'; ctx.shadowColor = '#000'; ctx.shadowBlur = 3; ctx.fillText(p.name, c.x, y); ctx.shadowBlur = 0;
      }
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); board.removeEventListener('load', boardLoaded); };
  }, [camera, state, selectedProvinceId, selectedArmyId, moveTargets, attackTargets]);

  const handleDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect(), p = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const g = gesture.current; g.points.set(event.pointerId, p); g.last = p; g.dragged = false;
    if (g.points.size === 2) { const [a, b] = [...g.points.values()]; g.initialDistance = Math.hypot(a.x - b.x, a.y - b.y); }
  };
  const handleMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const g = gesture.current; if (!g.points.has(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect(), p = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    g.points.set(event.pointerId, p);
    if (g.points.size >= 2) {
      const [a, b] = [...g.points.values()], dist = Math.hypot(a.x - b.x, a.y - b.y), old = g.initialDistance || dist;
      camera.transform({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, { x: 0, y: 0 }, dist / old); g.initialDistance = dist; g.dragged = true;
    } else if (g.last) {
      const dx = p.x - g.last.x, dy = p.y - g.last.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) g.dragged = true;
      camera.transform(p, { x: dx, y: dy }, 1);
    }
    g.last = p;
  };
  const handleUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const g = gesture.current; if (!g.points.has(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect(), tap = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const wasTap = !g.dragged && g.points.size === 1; g.points.delete(event.pointerId); g.last = null;
    if (!g.points.size) { g.initialDistance = 0; if (wasTap) selectAt(tap); }
    else if (g.points.size === 1) g.last = [...g.points.values()][0];
  };
  const selectAt = (screen: Point) => {
    const { state: current, selectedArmyId: selected, onArmyTap: armyTap, onProvinceTap: provinceTap } = latest.current;
    const badges = getBadges(current).reverse();
    const badge = badges.find((b) => { const p = camera.worldToScreen({ x: b.x, y: b.y }), r = Math.max(b.w, b.h) * camera.scale * .65; return Math.hypot(p.x - screen.x, p.y - screen.y) <= Math.max(r, 19.2); });
    if (badge) {
      const i = badge.armies.findIndex((a) => a.id === selected); armyTap(badge.armies[(i + 1) % badge.armies.length].id); return;
    }
    const world = camera.screenToWorld(screen), hit = Math.max(TOKEN_HIT, 24 / camera.scale);
    const province = current.provinces.reduce<Province | null>((nearest, p) => !nearest || Math.hypot(p.center.x - world.x, p.center.y - world.y) < Math.hypot(nearest.center.x - world.x, nearest.center.y - world.y) ? p : nearest, null);
    if (province && Math.hypot(province.center.x - world.x, province.center.y - world.y) <= hit) provinceTap(province.id);
  };
  return <canvas ref={canvasRef} className={className ?? 'game-map'} aria-label="Campaign map" onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp} onWheel={(e) => { e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect(); camera.transform({ x: e.clientX - rect.left, y: e.clientY - rect.top }, { x: 0, y: 0 }, e.deltaY < 0 ? 1.15 : 1 / 1.15); }} />;
}
