import { useState, useCallback } from 'react';
import { ApiError } from 'services/products';

export interface ErrorState {
  error: ApiError | null;
  hasRetried: boolean;
  retryCount: number;
}

export interface UseErrorHandlerReturn {
  error: ApiError | null;
  hasRetried: boolean;
  retryCount: number;
  setError: (error: ApiError | null) => void;
  clearError: () => void;
  retry: () => void;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    maxRetries?: number
  ) => Promise<T | null>;
}

const useErrorHandler = (maxRetries: number = 3): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasRetried: false,
    retryCount: 0,
  });

  const setError = useCallback((error: ApiError | null) => {
    setErrorState(prev => ({
      ...prev,
      error,
      retryCount: error ? prev.retryCount : 0,
    }));
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasRetried: false,
      retryCount: 0,
    });
  }, []);

  const retry = useCallback(() => {
    if (errorState.error && errorState.error.retryable) {
      setErrorState(prev => ({
        ...prev,
        hasRetried: true,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [errorState.error]);

  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      maxRetriesForOperation: number = maxRetries
    ): Promise<T | null> => {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxRetriesForOperation; attempt++) {
        try {
          const result = await operation();
          clearError();
          return result;
        } catch (error) {
          lastError = error as Error;
          
          // Create ApiError from caught error
          let apiError: ApiError;
          
          if (error && typeof error === 'object' && 'response' in error) {
            // Axios error
            const axiosError = error as any;
            apiError = {
              message: axiosError.response?.data?.message || axiosError.message || 'Request failed',
              status: axiosError.response?.status,
              code: axiosError.code,
              retryable: attempt < maxRetriesForOperation && (axiosError.response?.status >= 500 || axiosError.code === 'ECONNABORTED'),
            };
          } else {
            // Generic error
            apiError = {
              message: error instanceof Error ? error.message : 'An unexpected error occurred',
              retryable: attempt < maxRetriesForOperation,
            };
          }
          
          setError(apiError);
          
          // Don't retry on last attempt or non-retryable errors
          if (attempt === maxRetriesForOperation || !apiError.retryable) {
            break;
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      return null;
    },
    [maxRetries, clearError, setError]
  );

  return {
    error: errorState.error,
    hasRetried: errorState.hasRetried,
    retryCount: errorState.retryCount,
    setError,
    clearError,
    retry,
    handleAsyncOperation,
  };
};

export default useErrorHandler; 