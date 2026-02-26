import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    const [notification, setNotification] = useState(null);

    // Persist cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.title === product.title);
            if (existing) {
                showNotification(`Quantité de "${product.title}" mise à jour`);
                return prev.map(item =>
                    item.product.title === product.title
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            showNotification(`"${product.title}" ajouté au panier`);
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productTitle) => {
        setCart(prev => prev.filter(item => item.product.title !== productTitle));
    };

    const updateQuantity = (productTitle, quantity) => {
        if (quantity < 1) {
            removeFromCart(productTitle);
            return;
        }
        setCart(prev =>
            prev.map(item =>
                item.product.title === productTitle
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.product.price) || 0;
            return total + price * item.quantity;
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            notification,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
