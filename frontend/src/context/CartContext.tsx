import React, { createContext, useContext, useState, useMemo } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    totalPrice: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity: number) => {
        setItems(currentItems => {
            const existing = currentItems.find(item => item.id === product.id);
            if (existing) {
                return currentItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...currentItems, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== productId));
    };

    const clearCart = () => setItems([]);

    const totalPrice = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};
