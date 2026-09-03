import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Render Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#07090e] text-slate-200">
          <div className="max-w-md w-full bg-[#111520] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-light tracking-tight text-white mb-2">
                Workspace Recovery
              </h2>
              <p className="text-sm text-slate-400">
                A component error occurred during rendering. The error has been captured safely.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs font-mono text-red-300 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
