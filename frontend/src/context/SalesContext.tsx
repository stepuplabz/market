import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
import { getAllOrders } from '../services/orderService';

interface Sale {
    id: string;
    orderId: string;
    amount: number;
    date: string;
    items: number;
}

interface SalesContextType {
    dailySales: number;
    weeklySales: number;
    monthlySales: number;
    salesHistory: Sale[];
    orders: Order[];
    pendingOrdersCount: number;
    addSale: (orderId: string, amount: number, items: number) => void;
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    removeOrder: (orderId: string) => void;
    refreshSalesData: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
    const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allOrders = await getAllOrders();
            setOrders(allOrders);

            // Reconstruct sales history from delivered orders
            const history: Sale[] = allOrders
                .filter(order => order.status === 'delivered')
                .map(order => ({
                    id: order.id, // Use order ID as sale ID
                    orderId: order.id,
                    amount: order.totalPrice + (order.deliveryFee || 0),
                    date: order.createdAt,
                    items: order.items.length
                }));
            setSalesHistory(history);
        } catch (error) {
            console.error('Failed to load sales data:', error);
        }
    };

    // ... (rest of the file)

    const today = new Date().toDateString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dailySales = salesHistory
        .filter(sale => new Date(sale.date).toDateString() === today)
        .reduce((sum, sale) => sum + sale.amount, 0);

    const weeklySales = salesHistory
        .filter(sale => new Date(sale.date) >= oneWeekAgo)
        .reduce((sum, sale) => sum + sale.amount, 0);

    const monthlySales = salesHistory
        .filter(sale => new Date(sale.date) >= oneMonthAgo)
        .reduce((sum, sale) => sum + sale.amount, 0);

    const pendingOrdersCount = orders.filter(o =>
        o.status !== 'delivered' && o.status !== 'cancelled'
    ).length;

    const addSale = (orderId: string, amount: number, items: number) => {
        const newSale: Sale = {
            id: Date.now().toString(),
            orderId,
            amount,
            date: new Date().toISOString(),
            items
        };
        setSalesHistory(prev => [newSale, ...prev]);
    };

    const addOrder = (order: Order) => {
        setOrders(prev => [order, ...prev]);
    };

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                // When completing an order, add it to sales
                if (status === 'delivered' && order.status !== 'delivered') {
                    addSale(orderId, order.totalPrice + order.deliveryFee, order.items.length);
                }
                return { ...order, status };
            }
            return order;
        }));
    };

    const removeOrder = (orderId: string) => {
        setOrders(prev => prev.filter(order => order.id !== orderId));
    };

    return (
        <SalesContext.Provider value={{
            dailySales,
            weeklySales,
            monthlySales,
            salesHistory,
            orders,
            pendingOrdersCount,
            addSale,
            addOrder,
            updateOrderStatus,
            removeOrder,
            refreshSalesData: loadData
        }}>
            {children}
        </SalesContext.Provider>
    );
}

export function useSales() {
    const context = useContext(SalesContext);
    if (context === undefined) {
        throw new Error('useSales must be used within a SalesProvider');
    }
    return context;
}
