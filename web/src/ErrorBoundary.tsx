import { Component, type ReactNode } from 'react';

interface State { error: Error | null }
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <pre style={{ margin: 0, padding: 16, color: '#F4EAD5', background: '#120F0C', minHeight: '100dvh', whiteSpace: 'pre-wrap' }}>{`Something went wrong.\n\n${this.state.error.message}`}</pre>;
  }
}
