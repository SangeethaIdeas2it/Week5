import React from 'react';
import { IProduct } from 'models';
import Product from './Product';
import { useProductsContext } from 'contexts/products-context/ProductsContextProvider';
import { isRetryableError } from 'services/products';

import * as S from './style';

interface IProps {
  products: IProduct[];
}

const Products = React.memo(({ products }: IProps) => {
  const { isFetching, error, retryFetch, clearError } = useProductsContext();

  const handleRetry = async () => {
    if (error && isRetryableError(error)) {
      await retryFetch();
    }
  };

  const handleDismissError = () => {
    clearError();
  };

  // Loading state
  if (isFetching) {
    return (
      <S.LoadingContainer>
        <S.LoadingSpinner />
        <S.LoadingText>Loading products...</S.LoadingText>
      </S.LoadingContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <S.ErrorContainer>
        <S.ErrorIcon>⚠️</S.ErrorIcon>
        <S.ErrorTitle>Failed to load products</S.ErrorTitle>
        <S.ErrorMessage>{error.message}</S.ErrorMessage>
        
        {isRetryableError(error) && (
          <S.RetryButton onClick={handleRetry}>
            Try Again
          </S.RetryButton>
        )}
        
        <S.DismissButton onClick={handleDismissError}>
          Dismiss
        </S.DismissButton>
      </S.ErrorContainer>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <S.EmptyContainer>
        <S.EmptyIcon>📦</S.EmptyIcon>
        <S.EmptyTitle>No products available</S.EmptyTitle>
        <S.EmptyMessage>
          We couldn't find any products at the moment. Please check back later.
        </S.EmptyMessage>
      </S.EmptyContainer>
    );
  }

  // Success state
  return (
    <S.Container>
      {products.map((p) => (
        <Product product={p} key={p.sku} />
      ))}
    </S.Container>
  );
});

Products.displayName = 'Products';

export default Products;
