import { createStore, type Store } from '../lib/store';
import { routeFromHash, routeToHash, MenuRoute, type Route } from './Routes';

export class Navigation {
  readonly route: Store<Route>;
  private stack: Route[];
  private readonly popListener = () => this.onPopState();
  constructor(initial?: Route) {
    const fromUrl = typeof window !== 'undefined' && window.location.hash ? routeFromHash(window.location.hash) : null;
    const first = fromUrl ?? initial ?? { screen: 'Splash' as const };
    this.route = createStore(first);
    this.stack = [first];
    if (typeof window !== 'undefined') window.addEventListener('popstate', this.popListener);
    if (typeof window !== 'undefined' && !window.location.hash) window.history.replaceState({ aroj: true }, '', routeToHash(first));
  }
  navigate(route: Route, options: { replace?: boolean; popTo?: Route['screen'] } = {}): void {
    if (options.popTo) {
      let i = -1;
      for (let index = this.stack.length - 1; index >= 0; index--) { if (this.stack[index].screen === options.popTo) { i = index; break; } }
      if (i >= 0) this.stack = this.stack.slice(0, i + 1);
    }
    if (options.replace) this.stack[this.stack.length - 1] = route;
    else this.stack.push(route);
    if (typeof window !== 'undefined') {
      const hash = routeToHash(route);
      if (options.replace) window.history.replaceState({ aroj: true }, '', hash);
      else window.history.pushState({ aroj: true }, '', hash);
    }
    this.route.set(route);
  }
  back(): void {
    if (this.stack.length > 1) {
      if (typeof window !== 'undefined') window.history.back();
      else { this.stack.pop(); this.route.set(this.stack[this.stack.length - 1]); }
    } else this.navigate(MenuRoute, { replace: true });
  }
  dispose(): void { if (typeof window !== 'undefined') window.removeEventListener('popstate', this.popListener); }
  private onPopState(): void {
    const fromHistory = routeFromHash(window.location.hash);
    if (this.stack.length > 1) this.stack.pop();
    else this.stack = [fromHistory ?? MenuRoute];
    const route = this.stack[this.stack.length - 1] ?? fromHistory ?? MenuRoute;
    if (fromHistory && routeToHash(fromHistory) !== routeToHash(route)) window.history.replaceState({ aroj: true }, '', routeToHash(route));
    this.route.set(route);
  }
}
