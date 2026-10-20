// Minimal synchronous hook runtime so the original useProvinceGameState hook
// can run headless in Node. State lives in call-order slots like React's.
let slots = [];
let idx = 0;

export function __reset() { slots = []; idx = 0; }
export function __beginRender() { idx = 0; }

export function useState(init) {
  const i = idx++;
  if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init;
  return [slots[i], (u) => { slots[i] = typeof u === 'function' ? u(slots[i]) : u; }];
}
export function useRef(init) {
  const i = idx++;
  if (!(i in slots)) slots[i] = { current: init };
  return slots[i];
}
export function useCallback(fn) { idx++; return fn; }
export function useEffect() { idx++; }
export function useMemo(fn) { idx++; return fn(); }
export function createContext(value) { return { Provider: null, Consumer: null, _value: value }; }
export function useContext(ctx) { return ctx._value; }
export default { useState, useRef, useCallback, useEffect, useMemo, createContext, useContext };
