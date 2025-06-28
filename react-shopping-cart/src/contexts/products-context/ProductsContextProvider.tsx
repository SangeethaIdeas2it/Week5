import React, { createContext, useContext, FC, useState, useCallback, useEffect } from 'react';
import { IProduct } from 'models';
import { getProducts, ApiError, ServiceResponse, isRetryableError } from 'services/products';

export interface IProductsContext {
  // State
  products: IProduct[];
  filters: string[];
  isFetching: boolean;
  error: ApiError | null;
  hasRetried: boolean;
  
  // Actions
  setProducts(products: IProduct[]): void;
  setFilters(filters: string[]): void;
  fetchProducts(): Promise<void>;
  retryFetch(): Promise<void>;
  clearError(): void;
}

const ProductsContext = createContext<IProductsContext | undefined>(undefined);

const useProductsContext = (): IProductsContext => {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      'useProductsContext must be used within a ProductsProvider'
    );
  }

  return context;
};

const ProductsProvider: FC = (props) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasRetried, setHasRetried] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      
      const response: ServiceResponse<IProduct[]> = await getProducts();
      
      if (response.error) {
        setError(response.error);
        setProducts([]);
      } else if (response.data) {
        setProducts(response.data);
        setError(null);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Failed to fetch products',
        retryable: true,
      };
      setError(apiError);
      setProducts([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const retryFetch = useCallback(async () => {
    if (error && isRetryableError(error)) {
      setHasRetried(true);
      await fetchProducts();
    }
  }, [error, fetchProducts]);

  // Auto-fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const ProductContextValue: IProductsContext = {
    products,
    filters,
    isFetching,
    error,
    hasRetried,
    setProducts,
    setFilters,
    fetchProducts,
    retryFetch,
    clearError,
  };

  return <ProductsContext.Provider value={ProductContextValue} {...props} />;
};

export { ProductsProvider, useProductsContext };
