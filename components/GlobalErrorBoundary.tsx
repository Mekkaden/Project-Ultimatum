"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors from anywhere below the root layout.
 *
 * Without this, a single uncaught error (a `.map()` over undefined, a bad
 * JSON.parse from storage, a null campaign) unmounts the entire React tree and
 * the WebView blanks out — which the user experiences as the app "crashing" or
 * force-exiting. A boundary keeps the shell alive and offers a way back.
 *
 * Deliberately NOT auto-reloading: a render error that recurs on every mount
 * would turn into a reload loop. The user chooses when to retry, and "Start
 * over" clears the stored route so a bad cached route can't re-trigger it.
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Keep this even in production: without it a crash leaves no trace at all.
    console.error("[GlobalErrorBoundary] Uncaught error:", error, info?.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  private handleStartOver = () => {
    try {
      // The last route is the usual culprit (a screen that can no longer render).
      localStorage.removeItem("ultimatum_last_route");
      sessionStorage.removeItem("ultimatum_last_back_exit");
    } catch {}
    this.setState({ error: null });
    try {
      window.location.replace("/");
    } catch {}
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 text-center">
        <div className="w-14 h-14 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center mb-6">
          <span className="text-2xl font-black text-red-500">!</span>
        </div>
        <h1 className="text-lg font-black uppercase tracking-widest text-white mb-2">
          Something broke
        </h1>
        <p className="text-sm text-neutral-400 max-w-sm mb-8 leading-relaxed">
          Your data is safe on this device. Try again, or start from the home screen.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={this.handleRetry}
            className="w-full py-3.5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full"
          >
            Try again
          </button>
          <button
            onClick={this.handleStartOver}
            className="w-full py-3.5 border border-neutral-800 text-neutral-400 font-black uppercase tracking-widest text-xs rounded-full"
          >
            Start over
          </button>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <pre className="mt-8 max-w-full overflow-auto text-left text-[10px] text-red-400/80 whitespace-pre-wrap break-words">
            {this.state.error?.message}
          </pre>
        )}
      </div>
    );
  }
}
