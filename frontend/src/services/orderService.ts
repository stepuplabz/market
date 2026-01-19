import { api } from './api';
import { CartItem, Order } from '../types';

export const createOrder = async (
    userId: string,
    items: CartItem[],
    totalPrice: number,
    address: string = 'Teslimat adresi belirtilmedi'
): Promise<boolean> => {
    try {
        const orderData = {
            userId,
            items,
            totalPrice,
            address
        };

        await api.post('/orders', orderData);
        return true;
    } catch (error) {
        console.error('Error adding order: ', error);
        return false;
    }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const orders = await api.get<Order[]>(`/orders/user/${userId}`);
        return orders;
    } catch (error) {
        console.error("Error fetching user orders: ", error);
        return [];
    }
};

export const getAllOrders = async (): Promise<Order[]> => {
    try {
        const orders = await api.get<Order[]>('/orders');
        return orders;
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        return [];
    }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
    try {
        await api.put(`/orders/${orderId}/status`, { status });
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
};

export const cancelOrder = async (orderId: string): Promise<boolean> => {
    try {
        await api.post(`/orders/${orderId}/cancel`, {});
        return true;
    } catch (error) {
        console.error('Error cancelling order:', error);
        return false;
    }
};
