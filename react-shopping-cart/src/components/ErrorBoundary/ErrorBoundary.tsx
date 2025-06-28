import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as S from './style';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: log to error reporting service
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <S.ErrorContainer>
          <S.ErrorIcon>⚠️</S.ErrorIcon>
          <S.ErrorTitle>Something went wrong</S.ErrorTitle>
          <S.ErrorMessage>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </S.ErrorMessage>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <S.ErrorDetails>
              <S.ErrorDetailsTitle>Error Details (Development):</S.ErrorDetailsTitle>
              <S.ErrorStack>{this.state.error.toString()}</S.ErrorStack>
              {this.state.errorInfo && (
                <S.ErrorStack>{this.state.errorInfo.componentStack}</S.ErrorStack>
              )}
            </S.ErrorDetails>
          )}
          
          <S.RetryButton onClick={this.handleRetry}>
            Try Again
          </S.RetryButton>
          
          <S.RefreshButton onClick={() => window.location.reload()}>
            Refresh Page
          </S.RefreshButton>
        </S.ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 