import React, { useCallback } from 'react';
import formatPrice from 'utils/formatPrice';
import { validateImageSource, validateClickEvent, sanitizeHtml } from 'utils/security';
import { ICartProduct } from 'models';

import { useCart } from 'contexts/cart-context';

import * as S from './style';

interface IProps {
  product: ICartProduct;
}

const CartProduct = React.memo(({ product }: IProps) => {
  const { removeProduct, increaseProductQuantity, decreaseProductQuantity } =
    useCart();
  const {
    sku,
    title,
    price,
    style,
    currencyId,
    currencyFormat,
    availableSizes,
    quantity,
  } = product;

  // Validate and sanitize product data
  const sanitizedTitle = sanitizeHtml(title || '');
  const sanitizedStyle = sanitizeHtml(style || '');
  const sanitizedSizes = availableSizes?.map(size => sanitizeHtml(size)).filter(Boolean) || [];
  
  // Secure image source validation
  const imageSrc = validateImageSource(
    require(`static/products/${sku}-1-cart.webp`),
    ['localhost', 'react-shopping-cart-67954.firebaseio.com']
  );

  const handleRemoveProduct = useCallback((event: React.MouseEvent) => {
    if (!validateClickEvent(event)) {
      return;
    }
    removeProduct(product);
  }, [product, removeProduct]);

  const handleIncreaseProductQuantity = useCallback((event: React.MouseEvent) => {
    if (!validateClickEvent(event)) {
      return;
    }
    increaseProductQuantity(product);
  }, [product, increaseProductQuantity]);

  const handleDecreaseProductQuantity = useCallback((event: React.MouseEvent) => {
    if (!validateClickEvent(event)) {
      return;
    }
    decreaseProductQuantity(product);
  }, [product, decreaseProductQuantity]);

  return (
    <S.Container>
      <S.DeleteButton
        onClick={handleRemoveProduct}
        title="remove product from cart"
        aria-label={`Remove ${sanitizedTitle} from cart`}
      />
      <S.Image
        src={imageSrc}
        alt={sanitizedTitle}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          e.currentTarget.src = '/placeholder-image.png';
        }}
      />
      <S.Details>
        <S.Title>{sanitizedTitle}</S.Title>
        <S.Desc>
          {sanitizedSizes.length > 0 ? `${sanitizedSizes[0]} | ${sanitizedStyle}` : sanitizedStyle} <br />
          Quantity: {Math.max(1, quantity || 1)}
        </S.Desc>
      </S.Details>
      <S.Price>
        <p>{`${sanitizeHtml(currencyFormat || '$')}  ${formatPrice(price || 0, currencyId || 'USD')}`}</p>
        <div>
          <S.ChangeQuantity
            onClick={handleDecreaseProductQuantity}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            -
          </S.ChangeQuantity>
          <S.ChangeQuantity 
            onClick={handleIncreaseProductQuantity}
            aria-label="Increase quantity"
          >
            +
          </S.ChangeQuantity>
        </div>
      </S.Price>
    </S.Container>
  );
});

CartProduct.displayName = 'CartProduct';

export default CartProduct;
