import { Component, ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isRetrying: boolean;
  retryCount: number;
}

class ChunkErrorBoundary extends Component<Props, State> {
  private maxAutoRetries = 2;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isRetrying: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    // Check if it's a chunk loading error
    const isChunkError = 
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Loading CSS chunk') ||
      error.name === 'ChunkLoadError';
    
    if (isChunkError) {
      return { hasError: true };
    }
    
    // For non-chunk errors, don't catch them - return null to let them propagate
    return null;
  }

  componentDidCatch(error: Error) {
    console.error('Chunk loading error:', error);
    
    // Auto-retry for chunk errors
    if (this.state.retryCount < this.maxAutoRetries) {
      this.handleAutoRetry();
    }
  }

  handleAutoRetry = () => {
    this.setState({ isRetrying: true, retryCount: this.state.retryCount + 1 });
    
    // Clear module cache and reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  handleManualRetry = () => {
    this.setState({ isRetrying: true });
    
    // Force reload to get fresh assets
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If auto-retrying, show minimal loading state
      if (this.state.isRetrying) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center p-6">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-muted-foreground">
                Mise à jour en cours...
              </p>
            </div>
          </div>
        );
      }

      // After max retries, show manual retry option
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center p-6 max-w-md">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Erreur de chargement
            </h2>
            <p className="text-muted-foreground text-sm">
              Une nouvelle version de l'application est disponible. 
              Veuillez rafraîchir la page pour continuer.
            </p>
            <Button 
              onClick={this.handleManualRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Rafraîchir la page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
