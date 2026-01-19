import { api } from './api';
import { Address } from '../types';

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
    try {
        // userId is ignored by backend (uses token), but kept for signature compatibility if valid
        const addresses = await api.get<Address[]>('/addresses');
        return addresses;
    } catch (error) {
        console.error("Error fetching addresses: ", error);
        return [];
    }
};

export const addUserAddress = async (userId: string, address: Omit<Address, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
        await api.post('/addresses', address);
        return true;
    } catch (error) {
        console.error("Error adding address: ", error);
        return false;
    }
};

export const deleteUserAddress = async (userId: string, addressId: string): Promise<boolean> => {
    try {
        await api.delete(`/addresses/${addressId}`);
        return true;
    } catch (error) {
        console.error("Error deleting address: ", error);
        return false;
    }
};
