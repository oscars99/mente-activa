import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '../i18n';

interface State {
  failed: boolean;
}

/**
 * Last line of defence: if any screen throws, show a calm message and a way home
 * instead of a blank page. Saved progress lives in localStorage and is not touched.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mente Activa: error en pantalla', error, info.componentStack);
  }

  private goHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4" role="alert">
        <div className="card text-center">
          <p className="text-6xl" aria-hidden>
            🧩
          </p>
          <h1 className="mt-4 text-3xl font-bold">{i18n.t('error.title')}</h1>
          <p className="mt-3 text-xl">{i18n.t('error.body')}</p>
          <button type="button" className="btn-primary mt-8 w-full" onClick={this.goHome}>
            {i18n.t('error.home')}
          </button>
        </div>
      </main>
    );
  }
}
