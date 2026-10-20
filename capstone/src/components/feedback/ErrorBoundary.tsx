import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="unilib-error-boundary-wrap">
          <div className="unilib-error-card">
            <div className="unilib-error-card__icon-wrap">
              <AlertCircle size={24} />
            </div>
            <h3 className="unilib-error-card__title">
              Something went wrong
            </h3>
            <p className="unilib-error-card__desc">
              An unexpected error occurred while rendering this view. You can reload the application to restore state.
            </p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw size={16} />}
              onClick={this.handleReset}
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
