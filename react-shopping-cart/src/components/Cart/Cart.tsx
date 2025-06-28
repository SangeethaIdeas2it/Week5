import React, { useCallback } from 'react';
import formatPrice from 'utils/formatPrice';
import { validateClickEvent, sanitizeHtml } from 'utils/security';
import CartProducts from './CartProducts';

import { useCart } from 'contexts/cart-context';

import * as S from './style';

const Cart = () => {
  const { products, total, isOpen, openCart, closeCart } = useCart();

  const handleCheckout = useCallback((event: React.MouseEvent) => {
    if (!validateClickEvent(event)) {
      return;
    }
    
    if (total.productQuantity) {
      const sanitizedMessage = sanitizeHtml(
        `Checkout - Subtotal: ${total.currencyFormat} ${formatPrice(
          total.totalPrice,
          total.currencyId
        )}`
      );
      alert(sanitizedMessage);
    } else {
      alert('Add some product in the cart!');
    }
  }, [total]);

  const handleToggleCart = useCallback((isOpen: boolean) => (event: React.MouseEvent) => {
    if (!validateClickEvent(event)) {
      return;
    }
    
    if (isOpen) {
      closeCart();
    } else {
      openCart();
    }
  }, [openCart, closeCart]);

  // Sanitize total data
  const sanitizedTotal = {
    productQuantity: Math.max(0, total.productQuantity || 0),
    totalPrice: Math.max(0, total.totalPrice || 0),
    currencyId: ['USD', 'BRL', 'EUR'].includes(total.currencyId) ? total.currencyId : 'USD',
    currencyFormat: sanitizeHtml(total.currencyFormat || '$'),
    installments: Math.max(0, total.installments || 0),
  };

  return (
    <S.Container isOpen={isOpen}>
      <S.CartButton 
        onClick={handleToggleCart(isOpen)}
        aria-label={isOpen ? 'Close cart' : 'Open cart'}
      >
        {isOpen ? (
          <span>X</span>
        ) : (
          <S.CartIcon>
            <S.CartQuantity title="Products in cart quantity">
              {sanitizedTotal.productQuantity}
            </S.CartQuantity>
          </S.CartIcon>
        )}
      </S.CartButton>

      {isOpen && (
        <S.CartContent>
          <S.CartContentHeader>
            <S.CartIcon large>
              <S.CartQuantity>{sanitizedTotal.productQuantity}</S.CartQuantity>
            </S.CartIcon>
            <S.HeaderTitle>Cart</S.HeaderTitle>
          </S.CartContentHeader>

          <CartProducts products={products} />

          <S.CartFooter>
            <S.Sub>SUBTOTAL</S.Sub>
            <S.SubPrice>
              <S.SubPriceValue>{`${sanitizedTotal.currencyFormat} ${formatPrice(
                sanitizedTotal.totalPrice,
                sanitizedTotal.currencyId
              )}`}</S.SubPriceValue>
              <S.SubPriceInstallment>
                {sanitizedTotal.installments ? (
                  <span>
                    {`OR UP TO ${sanitizedTotal.installments} x ${
                      sanitizedTotal.currencyFormat
                    } ${formatPrice(
                      sanitizedTotal.totalPrice / sanitizedTotal.installments,
                      sanitizedTotal.currencyId
                    )}`}
                  </span>
                ) : null}
              </S.SubPriceInstallment>
            </S.SubPrice>
            <S.CheckoutButton 
              onClick={handleCheckout} 
              autoFocus
              aria-label="Proceed to checkout"
            >
              Checkout
            </S.CheckoutButton>
          </S.CartFooter>
        </S.CartContent>
      )}
    </S.Container>
  );
};

export default Cart;
