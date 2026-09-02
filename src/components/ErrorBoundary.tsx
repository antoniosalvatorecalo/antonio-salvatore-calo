import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] React render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary, #0a0a0a)',
            color: 'var(--text-primary, #f0f0f0)',
            fontFamily: 'system-ui, sans-serif',
            zIndex: 9999,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 480, padding: 24 }}>
            <p style={{ fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16, opacity: 0.5 }}>
              Something broke
            </p>
            <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred during render.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 24,
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: 12,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
