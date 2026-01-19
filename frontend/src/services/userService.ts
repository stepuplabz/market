import { api } from './api';
import { User } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const users = await api.get<User[]>('/users');
        return users;
    } catch (error) {
        console.error("Error fetching all users: ", error);
        return [];
    }
};

export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const user = await api.get<User>(`/users/${id}`);
        return user;
    } catch (error) {
        console.error("Error fetching user details: ", error);
        return null;
    }
};
