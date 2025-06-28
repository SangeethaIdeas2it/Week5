import React, { KeyboardEvent, useCallback, useMemo } from 'react';

import formatPrice from 'utils/formatPrice';
import { validateClickEvent, sanitizeHtml, validateInput } from 'utils/security';
import { IProduct } from 'models';

import { useCart } from 'contexts/cart-context';

import * as S from './style';

interface IProps {
  product: IProduct;
}

const Product = ({ product }: IProps) => {
  const { openCart, addProduct } = useCart();
  
  // Validate and sanitize product data using useMemo
  const sanitizedProduct = useMemo(() => {
    const sanitizedSku = validateInput(product.sku, 'number');
    const sanitizedTitle = validateInput(product.title, 'text');
    const sanitizedPrice = validateInput(product.price, 'number');
    const sanitizedInstallments = validateInput(product.installments, 'number');
    const sanitizedCurrencyFormat = validateInput(product.currencyFormat, 'text');
    
    return {
      sku: typeof sanitizedSku === 'number' ? sanitizedSku : 0,
      title: typeof sanitizedTitle === 'string' ? sanitizedTitle : 'Unknown Product',
      price: typeof sanitizedPrice === 'number' ? sanitizedPrice : 0,
      installments: typeof sanitizedInstallments === 'number' ? sanitizedInstallments : 0,
      currencyId: ['USD', 'BRL', 'EUR'].includes(product.currencyId) ? product.currencyId : 'USD',
      currencyFormat: typeof sanitizedCurrencyFormat === 'string' ? sanitizedCurrencyFormat : '$',
      isFreeShipping: Boolean(product.isFreeShipping),
    };
  }, [product]);

  const handleAddProduct = useCallback((event: React.MouseEvent) => {
    if (!validateClickEvent(event)) {
      return;
    }
    
    // Create a safe product object with validated data
    const safeProduct = {
      ...product,
      quantity: 1,
      title: sanitizedProduct.title,
      price: sanitizedProduct.price,
      currencyId: sanitizedProduct.currencyId,
      currencyFormat: sanitizedProduct.currencyFormat,
    };
    
    addProduct(safeProduct);
    openCart();
  }, [product, addProduct, openCart, sanitizedProduct]);

  const handleAddProductWhenEnter = useCallback((event: KeyboardEvent) => {
    // Only allow Enter and Space keys
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      
      const safeProduct = {
        ...product,
        quantity: 1,
        title: sanitizedProduct.title,
        price: sanitizedProduct.price,
        currencyId: sanitizedProduct.currencyId,
        currencyFormat: sanitizedProduct.currencyFormat,
      };
      
      addProduct(safeProduct);
      openCart();
    }
  }, [product, addProduct, openCart, sanitizedProduct]);

  // Validate all required fields - moved after hooks
  if (!sanitizedProduct.sku || !sanitizedProduct.title || !sanitizedProduct.price) {
    console.warn('Invalid product data:', product);
    return null;
  }

  const formattedPrice = formatPrice(sanitizedProduct.price, sanitizedProduct.currencyId);
  let productInstallment;

  if (sanitizedProduct.installments && sanitizedProduct.installments > 1) {
    const installmentPrice = sanitizedProduct.price / sanitizedProduct.installments;

    productInstallment = (
      <S.Installment>
        <span>or {sanitizedProduct.installments} x</span>
        <b>
          {sanitizeHtml(sanitizedProduct.currencyFormat)}
          {formatPrice(installmentPrice, sanitizedProduct.currencyId)}
        </b>
      </S.Installment>
    );
  }

  return (
    <S.Container 
      onKeyUp={handleAddProductWhenEnter} 
      sku={sanitizedProduct.sku} 
      tabIndex={1}
      role="button"
      aria-label={`Add ${sanitizedProduct.title} to cart`}
    >
      {sanitizedProduct.isFreeShipping && <S.Stopper>Free shipping</S.Stopper>}
      <S.Image 
        alt={sanitizedProduct.title}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-image.png';
        }}
      />
      <S.Title>{sanitizedProduct.title}</S.Title>
      <S.Price>
        <S.Val>
          <small>{sanitizeHtml(sanitizedProduct.currencyFormat)}</small>
          <b>{formattedPrice.substring(0, formattedPrice.length - 3)}</b>
          <span>{formattedPrice.substring(formattedPrice.length - 3)}</span>
        </S.Val>
        {productInstallment}
      </S.Price>
      <S.BuyButton 
        onClick={handleAddProduct} 
        tabIndex={-1}
        aria-label={`Add ${sanitizedProduct.title} to cart`}
      >
        Add to cart
      </S.BuyButton>
    </S.Container>
  );
};

export default Product;
