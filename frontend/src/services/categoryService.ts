import { api } from './api';
import { Category } from '../types';

export const subscribeToCategories = (onUpdate: (categories: Category[]) => void) => {
    api.get<Category[]>('/categories')
        .then(categories => {
            onUpdate(categories);
        })
        .catch(err => {
            console.error('Failed to fetch categories:', err);
            onUpdate([]);
        });
    // Return dummy unsubscribe
    return () => { };
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
        await api.post('/categories', category);
        return true;
    } catch (error) {
        console.error("Error adding category: ", error);
        throw error;
    }
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
        console.warn('Update category not implemented in backend');
        return false;
    } catch (error) {
        console.error("Error updating category: ", error);
        throw error;
    }
};

export const deleteCategory = async (id: string) => {
    try {
        console.warn('Delete category not implemented in backend');
        return false;
    } catch (error) {
        console.error("Error deleting category: ", error);
        throw error;
    }
};

export const uploadCategoryIcon = async (uri: string): Promise<string> => {
    console.warn('Image upload disabled - using placeholder');
    return 'https://via.placeholder.com/150';
};
