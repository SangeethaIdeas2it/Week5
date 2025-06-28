import React, { createContext, useContext, FC, useState, useCallback } from 'react';
import { ICartProduct, ICartTotal } from 'models';

export interface CartError {
  message: string;
  code?: string;
  retryable: boolean;
}

export interface ICartContext {
  // State
  isOpen: boolean;
  products: ICartProduct[];
  total: ICartTotal;
  error: CartError | null;
  
  // Actions
  setIsOpen(state: boolean): void;
  setProducts(products: ICartProduct[]): void;
  setTotal(products: any): void;
  clearError(): void;
  retryOperation(): void;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

const useCartContext = (): ICartContext => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }

  return context;
};

const totalInitialValues = {
  productQuantity: 0,
  installments: 0,
  totalPrice: 0,
  currencyId: 'USD',
  currencyFormat: '$',
};

const CartProvider: FC = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<ICartProduct[]>([]);
  const [total, setTotal] = useState<ICartTotal>(totalInitialValues);
  const [error, setError] = useState<CartError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryOperation = useCallback(() => {
    if (error && error.retryable) {
      setError(null);
      // Retry logic would be implemented here
    }
  }, [error]);

  const CartContextValue: ICartContext = {
    isOpen,
    products,
    total,
    error,
    setIsOpen,
    setProducts,
    setTotal,
    clearError,
    retryOperation,
  };

  return <CartContext.Provider value={CartContextValue} {...props} />;
};

export { CartProvider, useCartContext };
