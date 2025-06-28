import React from 'react';
import { IProduct } from 'models';
import Product from './Product';

import * as S from './style';

interface IProps {
  products: IProduct[];
}

const Products = React.memo(({ products }: IProps) => {
  return (
    <S.Container>
      {products?.map((p) => (
        <Product product={p} key={p.sku} />
      ))}
    </S.Container>
  );
});

Products.displayName = 'Products';

export default Products;
