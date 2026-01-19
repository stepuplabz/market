export type Role = 'user' | 'admin';

export interface User {
    id: string;
    phone: string;
    password?: string;
    name?: string;
    address?: string;
    role: Role;
    token?: string;
    createdAt: any;
}

export interface Product {
    id: string;
    name: string;
    barcode: string;
    category: string;
    brand?: string; // New: Brand name
    description?: string; // New: Short description
    price: number;
    originalPrice?: number; // New: For campaign pricing
    campaignStartDate?: string; // ISO Date string
    campaignEndDate?: string; // ISO Date string
    stock: number;
    unitType: 'piece' | 'kg';
    imageUrl?: string;
    createdAt?: any;
    isCampaign?: boolean;
    salesCount?: number;
}

export interface CartItem extends Product {
    quantity: number; // For pieces: integer. For kg: float (e.g. 0.5)
}

export interface Category {
    id: string;
    name: string;
    image?: string;
    icon?: string;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
    deliveryFee: number;
    status: 'waiting_approval' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
    orderCode: string;
    address: string;
    createdAt: any;
}

export interface Address {
    id: string;
    title: string;
    city: string;
    district: string;
    fullAddress: string;
    createdAt: any;
}
