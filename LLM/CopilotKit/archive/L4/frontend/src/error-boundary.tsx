import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-50 p-8">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <pre className="text-left text-sm bg-red-50 border border-red-200 rounded p-4 overflow-auto max-h-48 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <p className="text-gray-600">
              Re-run the <code className="bg-gray-200 px-1 rounded">display_app()</code> cell to reload.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
