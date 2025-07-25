import React from 'react';
import { useEffect } from 'react';

import Loader from 'components/Loader';
import { GithubCorner, GithubStarButton } from 'components/Github';
import Recruiter from 'components/Recruiter';
import Filter from 'components/Filter';
import Products from 'components/Products';
import Cart from 'components/Cart';
import ErrorBoundary from 'components/ErrorBoundary';

import { useProducts } from 'contexts/products-context';

import * as S from './style';

const App = () => {
  const { isFetching, products, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ErrorBoundary>
      <S.Container>
        {isFetching && <Loader />}
        <GithubCorner />
        <Recruiter />
        <S.TwoColumnGrid>
          <S.Side>
            <Filter />
            <GithubStarButton />
          </S.Side>
          <S.Main>
            <S.MainHeader>
              <p>{products?.length} Product(s) found</p>
            </S.MainHeader>
            <Products products={products} />
          </S.Main>
        </S.TwoColumnGrid>
        <Cart />
      </S.Container>
    </ErrorBoundary>
  );
};

export default App;
