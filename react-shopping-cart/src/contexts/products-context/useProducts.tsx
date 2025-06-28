import { useCallback } from 'react';

import { useProductsContext } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

const useProducts = () => {
  const {
    isFetching,
    products,
    setProducts,
    filters,
    setFilters,
  } = useProductsContext();

  const fetchProducts = useCallback(async () => {
    const response = await getProducts();
    if (response.data) {
      setProducts(response.data);
    }
  }, [setProducts]);

  const filterProducts = useCallback(async (filters: string[]) => {
    const response = await getProducts();
    if (response.data) {
      let filteredProducts: IProduct[];

      if (filters && filters.length > 0) {
        filteredProducts = response.data.filter((p: IProduct) =>
          filters.find((filter: string) =>
            p.availableSizes.find((size: string) => size === filter)
          )
        );
      } else {
        filteredProducts = response.data;
      }

      setFilters(filters);
      setProducts(filteredProducts);
    }
  }, [setProducts, setFilters]);

  return {
    isFetching,
    fetchProducts,
    products,
    filterProducts,
    filters,
  };
};

export default useProducts;
